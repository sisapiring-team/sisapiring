import { useState, useEffect, useCallback } from 'react';
import { apiClient, apiErrorMessage } from '../lib/api';

export interface AdminOrderItem {
  id: number;
  productName: string;
  category: string;
  pricePerItem: number;
  originalPrice: number;
  quantity: number;
  image: string | null;
  subtotal: number;
}

export interface AdminOrderMerchant {
  id: string;
  businessName: string;
  district: string;
}

export interface AdminOrder {
  id: string;             // order_code
  orderId: number;
  groupCode: string | null;
  pickupCode: string;
  customerName: string;
  customerPhone: string;
  items: AdminOrderItem[];
  totalOriginalPrice: number;
  totalPayment: number;
  totalDiscount: number;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  orderDate: string;
  pickupDeadline: string | null;
  merchant: AdminOrderMerchant | null;
  isVerifiedByQR: boolean;
}

export interface AdminOrdersResponse {
  data: AdminOrder[];
  meta: { current_page: number; last_page: number; total: number };
}

function mapOrder(raw: Record<string, unknown>): AdminOrder {
  const items = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
  const merchant = raw.merchant ? (raw.merchant as Record<string, unknown>) : null;
  return {
    id: String(raw.id ?? ''),
    orderId: Number(raw.orderId ?? 0),
    groupCode: (raw.groupCode as string) || null,
    pickupCode: String(raw.pickupCode ?? ''),
    customerName: String(raw.customerName ?? ''),
    customerPhone: String(raw.customerPhone ?? ''),
    items: items.map((i) => ({
      id: Number(i.id ?? 0),
      productName: String(i.productName ?? ''),
      category: String(i.category ?? ''),
      pricePerItem: Number(i.pricePerItem ?? 0),
      originalPrice: Number(i.originalPrice ?? 0),
      quantity: Number(i.quantity ?? 1),
      image: (i.image as string) || null,
      subtotal: Number(i.subtotal ?? 0),
    })),
    totalOriginalPrice: Number(raw.totalOriginalPrice ?? 0),
    totalPayment: Number(raw.totalPayment ?? 0),
    totalDiscount: Number(raw.totalDiscount ?? 0),
    status: String(raw.status ?? ''),
    statusLabel: String(raw.statusLabel ?? ''),
    paymentStatus: String(raw.paymentStatus ?? ''),
    orderDate: String(raw.orderDate ?? ''),
    pickupDeadline: (raw.pickupDeadline as string) || null,
    merchant: merchant ? {
      id: String(merchant.id ?? ''),
      businessName: String(merchant.businessName ?? ''),
      district: String(merchant.district ?? ''),
    } : null,
    isVerifiedByQR: Boolean(raw.isVerifiedByQR ?? false),
  };
}

export type OrderStatusFilter = 'all' | 'pending_payment' | 'waiting_confirmation' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';

interface State {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  total: number;
}

export function useAdminOrders(statusFilter: OrderStatusFilter, query: string, page = 1) {
  // New CRUD stub for updating order status or payment info
  const updateOrderStatus = useCallback(async (id: string, payload: { status?: string; paymentStatus?: string }): Promise<AdminOrder> => {
    // Expected endpoint: PATCH /admin/orders/:id
    const response = await apiClient.patch(`/admin/orders/${id}`, payload);
    const updated = mapOrder((response.data as { data: Record<string, unknown> }).data);
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => (o.id === id ? updated : o)),
    }));
    return updated;
  }, []);

  const [state, setState] = useState<State>({ orders: [], loading: true, error: null, totalPages: 1, total: 0 });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, unknown> = { page, per_page: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (query.trim()) params.q = query.trim();

      const response = await apiClient.get('/admin/orders', { params });
      const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
      setState({
        orders: raw.data.map(mapOrder),
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

  return { ...state, reload: load };
}
