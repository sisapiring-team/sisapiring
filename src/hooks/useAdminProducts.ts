import { useState, useEffect, useCallback } from 'react';
import { apiClient, 
  fetchAdminProducts,
  moderateAdminProduct,
  apiErrorMessage,
  type AdminProduct,
} from '../lib/api';

export type ProductStatusFilter = 'all' | 'active' | 'under_review' | 'taken_down';

interface State {
  products: AdminProduct[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

export function useAdminProducts(statusFilter: ProductStatusFilter, query: string, page = 1) {
  // New CRUD stubs for creating and deleting products
  const createProduct = useCallback(async (data: Record<string, unknown>): Promise<AdminProduct> => {
    // Expected endpoint: POST /admin/products
    const response = await apiClient.post('/admin/products', data);
    const newProduct = (response.data as { data: AdminProduct }).data;
    setState(prev => ({
      ...prev,
      products: [newProduct, ...prev.products],
      total: prev.total + 1,
    }));
    return newProduct;
  }, []);

  const deleteProduct = useCallback(async (code: string): Promise<void> => {
    // Expected endpoint: DELETE /admin/products/:code
    await apiClient.delete(`/admin/products/${code}`);
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== code),
      total: prev.total - 1,
    }));
  }, []);

  const [state, setState] = useState<State>({
    products: [],
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

      const result = await fetchAdminProducts(params as Parameters<typeof fetchAdminProducts>[0]);
      setState({
        products: result.data,
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

  const moderate = useCallback(async (
    code: string,
    status: 'active' | 'under_review' | 'taken_down',
    reason?: string,
  ): Promise<AdminProduct> => {
    const updated = await moderateAdminProduct(code, status, reason);
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === code ? updated : p)),
    }));
    return updated;
  }, []);

  return { ...state, reload: load, moderate, createProduct, deleteProduct };
}
