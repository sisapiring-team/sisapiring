import { useState, useEffect, useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../lib/api';

export interface AdminDashboardImpact {
  totalPortions: number;
  totalWeightKg: number;
  totalCo2Kg: number;
  totalWaterLiters: number;
  totalMoneySaved: number;
}

export interface AdminDashboardStats {
  users: number;
  buyers: number;
  sellers: number;
  merchantsPending: number;
  merchantsVerified: number;
  productsUnderReview: number;
  orders: number;
  revenue: number;
  openDisputes: number;
  impact: AdminDashboardImpact;
}

export interface AdminDashboardOrder {
  id: string;
  customerName: string;
  orderDate: string;
  totalPayment: number;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  merchant: { businessName: string } | null;
  items: { productName: string; quantity: number }[];
}

interface State {
  stats: AdminDashboardStats | null;
  recentOrders: AdminDashboardOrder[];
  loading: boolean;
  error: string | null;
}

function mapImpact(raw: Record<string, unknown>): AdminDashboardImpact {
  return {
    totalPortions: Number(raw.totalPortions ?? raw.total_portions ?? 0),
    totalWeightKg: Number(raw.totalWeightKg ?? raw.total_weight_kg ?? 0),
    totalCo2Kg: Number(raw.totalCo2Kg ?? raw.total_co2_kg ?? 0),
    totalWaterLiters: Number(raw.totalWaterLiters ?? raw.total_water_liters ?? 0),
    totalMoneySaved: Number(raw.totalMoneySaved ?? raw.total_money_saved ?? 0),
  };
}

function mapStats(raw: Record<string, unknown>): AdminDashboardStats {
  return {
    users: Number(raw.users ?? 0),
    buyers: Number(raw.buyers ?? 0),
    sellers: Number(raw.sellers ?? 0),
    merchantsPending: Number(raw.merchantsPending ?? 0),
    merchantsVerified: Number(raw.merchantsVerified ?? 0),
    productsUnderReview: Number(raw.productsUnderReview ?? 0),
    orders: Number(raw.orders ?? 0),
    revenue: Number(raw.revenue ?? 0),
    openDisputes: Number(raw.openDisputes ?? 0),
    impact: mapImpact(
      raw.impact && typeof raw.impact === 'object'
        ? (raw.impact as Record<string, unknown>)
        : {}
    ),
  };
}

function mapOrder(raw: Record<string, unknown>): AdminDashboardOrder {
  const merchant = raw.merchant ? (raw.merchant as Record<string, unknown>) : null;
  const items = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
  return {
    id: String(raw.id ?? ''),
    customerName: String(raw.customerName ?? ''),
    orderDate: String(raw.orderDate ?? ''),
    totalPayment: Number(raw.totalPayment ?? 0),
    status: String(raw.status ?? ''),
    statusLabel: String(raw.statusLabel ?? ''),
    paymentStatus: String(raw.paymentStatus ?? ''),
    merchant: merchant ? { businessName: String(merchant.businessName ?? '') } : null,
    items: items.slice(0, 2).map((i) => ({
      productName: String(i.productName ?? ''),
      quantity: Number(i.quantity ?? 1),
    })),
  };
}

export function useAdminDashboard() {
  const [state, setState] = useState<State>({
    stats: null,
    recentOrders: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/admin/dashboard');
      const data = response.data as {
        stats: Record<string, unknown>;
        recentOrders: { data: Record<string, unknown>[] } | Record<string, unknown>[];
      };
      const orders = Array.isArray(data.recentOrders)
        ? data.recentOrders
        : (data.recentOrders as { data: Record<string, unknown>[] }).data ?? [];

      setState({
        stats: mapStats(data.stats),
        recentOrders: orders.map(mapOrder),
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: apiErrorMessage(err) }));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { ...state, reload: load };
}
