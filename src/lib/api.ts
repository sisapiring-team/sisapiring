import axios from 'axios';
import type { SisaPiringItem } from '../data/sisaPiringCatalog';
import type {
  FoodSafetyChecklist,
  Order,
  OrderStatus,
  ProductCategory,
  SellerProfile,
  SisaPiringProduct,
  StorageInstruction,
} from '../types/seller';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

const DEFAULT_CHECKLIST: FoodSafetyChecklist = {
  isFitForConsumption: true,
  isProperlyStored: true,
  isCleanPackaging: true,
  isNoAbnormalOdor: true,
  isAccurateInformation: true,
};

function mapProduct(raw: Record<string, unknown>): SisaPiringProduct {
  return {
    id: String(raw.id),
    name: String(raw.name),
    category: raw.category as ProductCategory,
    image: (raw.image as string) || '',
    originalPrice: Number(raw.originalPrice ?? 0),
    discountPercentage: Number(raw.discountPercentage ?? 50) as SisaPiringProduct['discountPercentage'],
    discountedPrice: Number(raw.discountedPrice ?? 0),
    stock: Number(raw.stock ?? 0),
    productionTime: (raw.productionTime as string) || 'Hari ini',
    safeConsumptionDeadline: (raw.safeConsumptionDeadline as string) || 'Hari ini',
    safeDeadlineTimestamp: Number(raw.safeDeadlineTimestamp ?? Date.now() + 3 * 60 * 60 * 1000),
    pickupScheduleStart: (raw.pickupScheduleStart as string) || '17:00 WIB',
    pickupScheduleEnd: (raw.pickupScheduleEnd as string) || '21:00 WIB',
    storageInstruction: ((raw.storageInstruction as string) || 'Suhu Ruang (Kering & Sejuk)') as StorageInstruction,
    isActive: Boolean(raw.isActive ?? true),
    foodSafetyChecklist: (raw.foodSafetyChecklist as FoodSafetyChecklist) || DEFAULT_CHECKLIST,
    description: (raw.description as string) || '',
    portionsRescuedCount: Number(raw.portionsRescuedCount ?? 0),
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
  };
}

function mapOrder(raw: Record<string, unknown>): Order {
  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    id: String(raw.id),
    pickupCode: String(raw.pickupCode ?? ''),
    customerName: String(raw.customerName ?? ''),
    customerPhone: String(raw.customerPhone ?? ''),
    items: items.map((item) => {
      const row = item as Record<string, unknown>;

      return {
        productId: String(row.productId ?? ''),
        productName: String(row.productName ?? ''),
        category: row.category as ProductCategory,
        pricePerItem: Number(row.pricePerItem ?? 0),
        quantity: Number(row.quantity ?? 1),
        image: (row.image as string) || '',
      };
    }),
    totalPayment: Number(raw.totalPayment ?? 0),
    orderDate: (raw.orderDate as string) || '',
    pickupDeadline: (raw.pickupDeadline as string) || '',
    status: (raw.status as OrderStatus) || 'waiting_confirmation',
    statusHistory: Array.isArray(raw.statusHistory)
      ? (raw.statusHistory as Order['statusHistory'])
      : [],
    cancellationReason: (raw.cancellationReason as string) || undefined,
    isVerifiedByQR: Boolean(raw.isVerifiedByQR ?? false),
    verifiedAt: (raw.verifiedAt as string) || undefined,
  };
}

export const apiClient = api;

export async function fetchCatalog(): Promise<SisaPiringItem[]> {
  const response = await api.get('/catalog');

  return unwrap<SisaPiringItem[]>(response.data);
}

export async function fetchProducts(): Promise<SisaPiringProduct[]> {
  const response = await api.get('/products');
  const rows = unwrap<Record<string, unknown>[]>(response.data);

  return rows.map(mapProduct);
}

export async function fetchCurrentMerchant(): Promise<SellerProfile> {
  const response = await api.get('/merchants/current');

  return unwrap<SellerProfile>(response.data);
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get('/orders');
  const rows = unwrap<Record<string, unknown>[]>(response.data);

  return rows.map(mapOrder);
}

export async function createProductRemote(
  product: Omit<SisaPiringProduct, 'id' | 'createdAt' | 'portionsRescuedCount'>
): Promise<SisaPiringProduct> {
  const response = await api.post('/products', product);

  return mapProduct(unwrap<Record<string, unknown>>(response.data));
}

export async function updateProductRemote(
  id: string,
  updates: Partial<SisaPiringProduct>
): Promise<SisaPiringProduct> {
  const response = await api.patch(`/products/${id}`, updates);

  return mapProduct(unwrap<Record<string, unknown>>(response.data));
}

export async function deleteProductRemote(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function updateProductStockRemote(id: string, delta: number): Promise<void> {
  await api.patch(`/products/${id}/stock`, { delta });
}

export async function applyProductDiscountRemote(id: string, discount: number): Promise<void> {
  await api.patch(`/products/${id}/discount`, { discountPercentage: discount });
}

export async function updateMerchantRemote(
  id: string,
  updates: Partial<SellerProfile>
): Promise<SellerProfile> {
  const response = await api.patch(`/merchants/${id}`, updates);

  return unwrap<SellerProfile>(response.data);
}

export async function createOrderRemote(
  items: { productId: string; quantity: number }[],
  customerName: string,
  customerPhone: string
): Promise<Order> {
  const response = await api.post('/orders', { items, customerName, customerPhone });

  return mapOrder(unwrap<Record<string, unknown>>(response.data));
}

export async function updateOrderStatusRemote(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const response = await api.patch(`/orders/${orderId}/status`, { status, note });

  return mapOrder(unwrap<Record<string, unknown>>(response.data));
}

export async function cancelOrderRemote(orderId: string, reason: string): Promise<Order> {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });

  return mapOrder(unwrap<Record<string, unknown>>(response.data));
}

export async function verifyOrderRemote(orderId: string): Promise<Order> {
  const response = await api.post(`/orders/${orderId}/verify`);

  return mapOrder(unwrap<Record<string, unknown>>(response.data));
}
