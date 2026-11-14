import { useState, useEffect, useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../lib/api';

export interface AdminDisputeMessage {
  id: number;
  body: string;
  sender: { id: number; name: string } | null;
  createdAt: string;
}

export interface AdminDispute {
  id: number;
  ticketCode: string;
  category: string;
  description: string;
  severity: string | null;
  status: string;
  resolutionType: string | null;
  resolutionNote: string | null;
  refundAmount: number;
  resolvedAt: string | null;
  createdAt: string;
  reporter: { id: number; name: string } | null;
  merchant: { id: string; businessName: string } | null;
  order: { id: string; status: string; totalPayment: number } | null;
  messages: AdminDisputeMessage[];
}

export interface AdminDisputesResponse {
  data: AdminDispute[];
  meta: { current_page: number; last_page: number; total: number };
}

function mapDispute(raw: Record<string, unknown>): AdminDispute {
  const reporter = raw.reporter ? (raw.reporter as Record<string, unknown>) : null;
  const merchant = raw.merchant ? (raw.merchant as Record<string, unknown>) : null;
  const order = raw.order ? (raw.order as Record<string, unknown>) : null;
  const messages = Array.isArray(raw.messages) ? (raw.messages as Record<string, unknown>[]) : [];

  return {
    id: Number(raw.id ?? 0),
    ticketCode: String(raw.ticketCode ?? ''),
    category: String(raw.category ?? ''),
    description: String(raw.description ?? ''),
    severity: (raw.severity as string) || null,
    status: String(raw.status ?? 'open'),
    resolutionType: (raw.resolutionType as string) || null,
    resolutionNote: (raw.resolutionNote as string) || null,
    refundAmount: Number(raw.refundAmount ?? 0),
    resolvedAt: (raw.resolvedAt as string) || null,
    createdAt: String(raw.createdAt ?? ''),
    reporter: reporter ? { id: Number(reporter.id ?? 0), name: String(reporter.name ?? '') } : null,
    merchant: merchant ? { id: String(merchant.id ?? ''), businessName: String(merchant.businessName ?? '') } : null,
    order: order ? { id: String(order.id ?? ''), status: String(order.status ?? ''), totalPayment: Number(order.totalPayment ?? 0) } : null,
    messages: messages.map((m) => {
      const sender = m.sender ? (m.sender as Record<string, unknown>) : null;
      return {
        id: Number(m.id ?? 0),
        body: String(m.body ?? ''),
        sender: sender ? { id: Number(sender.id ?? 0), name: String(sender.name ?? '') } : null,
        createdAt: String(m.createdAt ?? ''),
      };
    }),
  };
}

export type DisputeStatusFilter = 'all' | 'open' | 'investigating' | 'resolved_refund' | 'resolved_sanction' | 'rejected';

interface State {
  disputes: AdminDispute[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

export function useAdminDisputes(statusFilter: DisputeStatusFilter, query: string, page = 1) {
  const [state, setState] = useState<State>({ disputes: [], loading: true, error: null, totalPages: 1, total: 0 });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, unknown> = { page, per_page: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (query.trim()) params.q = query.trim();

      const response = await apiClient.get('/admin/disputes', { params });
      const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
      setState({
        disputes: raw.data.map(mapDispute),
        loading: false,
        error: null,
        totalPages: Number(raw.meta.last_page ?? 1),
        total: Number(raw.meta.total ?? 0),
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: apiErrorMessage(err) }));
    }
  }, [statusFilter, query, page]);

  useEffect(() => { void load(); }, [load]);

  const resolve = useCallback(async (
    id: number,
    status: string,
    resolutionNote: string,
    refundAmount?: number,
  ): Promise<AdminDispute> => {
    const response = await apiClient.post(`/admin/disputes/${id}/resolve`, {
      status,
      resolution_note: resolutionNote,
      refund_amount: refundAmount ?? 0,
      resolution_type: status === 'resolved_refund' ? 'refund' : status === 'resolved_sanction' ? 'sanction' : 'rejected',
    });
    const updated = mapDispute((response.data as { data: Record<string, unknown> }).data);
    setState((prev) => ({
      ...prev,
      disputes: prev.disputes.map((d) => (d.id === id ? updated : d)),
    }));
    return updated;
  }, []);

  return { ...state, reload: load, resolve };
}
