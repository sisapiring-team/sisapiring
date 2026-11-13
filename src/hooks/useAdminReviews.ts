import { useState, useEffect, useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../lib/api';

export interface AdminReview {
  id: number;
  rating: number;
  comment: string;
  tags: string[];
  moderationStatus: 'published' | 'flagged' | 'hidden';
  flagReason: string | null;
  adminReply: string | null;
  merchantReply: string | null;
  createdAt: string;
  reviewer: { id: number; name: string } | null;
  merchant: { id: string; businessName: string } | null;
  product: { id: string; name: string } | null;
}

export type ReviewStatusFilter = 'all' | 'published' | 'flagged' | 'hidden';

interface State {
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

function mapReview(raw: Record<string, unknown>): AdminReview {
  const reviewer = raw.reviewer ? (raw.reviewer as Record<string, unknown>) : null;
  const merchant = raw.merchant ? (raw.merchant as Record<string, unknown>) : null;
  const product  = raw.product  ? (raw.product  as Record<string, unknown>) : null;
  return {
    id: Number(raw.id ?? 0),
    rating: Number(raw.rating ?? 0),
    comment: String(raw.comment ?? ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    moderationStatus: (raw.moderationStatus as AdminReview['moderationStatus']) ?? 'published',
    flagReason: (raw.flagReason as string) || null,
    adminReply: (raw.adminReply as string) || null,
    merchantReply: (raw.merchantReply as string) || null,
    createdAt: String(raw.createdAt ?? ''),
    reviewer: reviewer ? { id: Number(reviewer.id), name: String(reviewer.name ?? '') } : null,
    merchant: merchant ? { id: String(merchant.id ?? ''), businessName: String(merchant.businessName ?? '') } : null,
    product:  product  ? { id: String(product.id  ?? ''), name: String(product.name  ?? '') } : null,
  };
}

export function useAdminReviews(statusFilter: ReviewStatusFilter, query: string, page = 1) {
  const [state, setState] = useState<State>({ reviews: [], loading: true, error: null, totalPages: 1, total: 0 });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, unknown> = { page, per_page: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (query.trim()) params.q = query.trim();
      const response = await apiClient.get('/admin/reviews', { params });
      const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
      setState({
        reviews: raw.data.map(mapReview),
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

  const moderate = useCallback(async (
    id: number,
    status: 'published' | 'flagged' | 'hidden',
    adminReply?: string,
    reason?: string,
  ): Promise<AdminReview> => {
    const response = await apiClient.post(`/admin/reviews/${id}/moderate`, {
      status,
      admin_reply: adminReply ?? undefined,
      reason: reason ?? undefined,
    });
    const updated = mapReview((response.data as { data: Record<string, unknown> }).data);
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? updated : r)),
    }));
    return updated;
  }, []);

  return { ...state, reload: load, moderate };
}
