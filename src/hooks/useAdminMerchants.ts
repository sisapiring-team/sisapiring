
import { useState, useEffect, useCallback } from 'react';

import { apiClient, 
  fetchAdminMerchants,
  verifyAdminMerchant,
  suspendAdminMerchant,
  reinstateAdminMerchant,
  apiErrorMessage,
  type AdminMerchant,
} from '../lib/api';

export type MerchantStatusFilter = 'all' | 'pending_review' | 'verified' | 'rejected';

interface State {
  merchants: AdminMerchant[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

export function useAdminMerchants(statusFilter: MerchantStatusFilter, query: string, page = 1) {
  // New CRUD stubs for creating a merchant (onboarding)
  const createMerchant = useCallback(async (data: Record<string, unknown>): Promise<AdminMerchant> => {
    // Expected endpoint: POST /admin/merchants
    const response = await apiClient.post('/admin/merchants', data);
    const newMerchant = (response.data as { data: AdminMerchant }).data;
    setState(prev => ({
      ...prev,
      merchants: [newMerchant, ...prev.merchants],
      total: prev.total + 1,
    }));
    return newMerchant;
  }, []);

  const [state, setState] = useState<State>({
    merchants: [],
    loading: true,
    error: null,
    totalPages: 1,
    total: 0,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, unknown> = { page, per_page: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (query.trim()) params.q = query.trim();

      const result = await fetchAdminMerchants(params as Parameters<typeof fetchAdminMerchants>[0]);
      setState({
        merchants: result.data,
        loading: false,
        error: null,
        totalPages: result.meta.last_page,
        total: result.meta.total,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: apiErrorMessage(err) }));
    }
  }, [statusFilter, query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const verify = useCallback(async (code: string, status: 'verified' | 'rejected', note?: string): Promise<AdminMerchant> => {
    const updated = await verifyAdminMerchant(code, status, note);
    setState((prev) => ({
      ...prev,
      merchants: prev.merchants.map((m) => (m.id === code ? updated : m)),
    }));
    return updated;
  }, []);

  const suspend = useCallback(async (code: string, reason: string): Promise<AdminMerchant> => {
    const updated = await suspendAdminMerchant(code, reason);
    setState((prev) => ({
      ...prev,
      merchants: prev.merchants.map((m) => (m.id === code ? updated : m)),
    }));
    return updated;
  }, []);

  const reinstate = useCallback(async (code: string): Promise<AdminMerchant> => {
    const updated = await reinstateAdminMerchant(code);
    setState((prev) => ({
      ...prev,
      merchants: prev.merchants.map((m) => (m.id === code ? updated : m)),
    }));
    return updated;
  }, []);

  return { ...state, reload: load, verify, suspend, reinstate, createMerchant };
}
