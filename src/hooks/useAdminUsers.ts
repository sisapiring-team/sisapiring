import { useState, useEffect, useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../lib/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  accountStatus: 'active' | 'warning' | 'suspended';
  district: string | null;
  violationCount: number;
  createdAt: string;
  merchant: { id: string; businessName: string; verificationStatus: string } | null;
}

export type UserRoleFilter    = 'all' | 'buyer' | 'seller' | 'admin';
export type UserStatusFilter  = 'all' | 'active' | 'warning' | 'suspended';

interface State {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

function mapUser(raw: Record<string, unknown>): AdminUser {
  const merchant = raw.merchant ? (raw.merchant as Record<string, unknown>) : null;
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    role: (raw.role as AdminUser['role']) ?? 'buyer',
    accountStatus: (raw.accountStatus as AdminUser['accountStatus']) ?? 'active',
    district: (raw.district as string) || null,
    violationCount: Number(raw.violationCount ?? 0),
    createdAt: String(raw.createdAt ?? ''),
    merchant: merchant ? {
      id: String(merchant.id ?? ''),
      businessName: String(merchant.businessName ?? ''),
      verificationStatus: String(merchant.verificationStatus ?? ''),
    } : null,
  };
}

export function useAdminUsers(
  roleFilter: UserRoleFilter,
  statusFilter: UserStatusFilter,
  query: string,
  page = 1,
) {
  // New CRUD stubs for creating and deleting users
  const createUser = useCallback(async (data: Record<string, unknown>): Promise<AdminUser> => {
    // Expected endpoint: POST /admin/users
    const response = await apiClient.post('/admin/users', data);
    const newUser = mapUser((response.data as { data: Record<string, unknown> }).data);
    setState(prev => ({
      ...prev,
      users: [newUser, ...prev.users],
      total: prev.total + 1,
    }));
    return newUser;
  }, []);

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    // Expected endpoint: DELETE /admin/users/:id
    await apiClient.delete(`/admin/users/${id}`);
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
      total: prev.total - 1,
    }));
  }, []);

  const [state, setState] = useState<State>({ users: [], loading: true, error: null, totalPages: 1, total: 0 });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, unknown> = { page, per_page: 20 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (query.trim()) params.q = query.trim();
      const response = await apiClient.get('/admin/users', { params });
      const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
      setState({
        users: raw.data.map(mapUser),
        loading: false,
        error: null,
        totalPages: Number(raw.meta.last_page ?? 1),
        total: Number(raw.meta.total ?? 0),
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: apiErrorMessage(err) }));
    }
  }, [roleFilter, statusFilter, query, page]);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = useCallback(async (
    id: number,
    status: 'active' | 'warning' | 'suspended',
    note?: string,
  ): Promise<AdminUser> => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status, note });
    const updated = mapUser((response.data as { data: Record<string, unknown> }).data);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? updated : u)),
    }));
    return updated;
  }, []);

  return { ...state, reload: load, updateStatus, createUser, deleteUser };
}
