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
  VerificationStatus,
} from '../types/seller';

const TOKEN_KEY = 'sisapiring_api_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

export function getAuthToken(): string | null {
  return readToken();
}

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function apiErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (axios.isAxiosError(error)) {
    const data = asRecord(error.response?.data);
    const errors = asRecord(data.errors);
    const first = Object.values(errors)[0];
    if (Array.isArray(first) && first.length > 0) return String(first[0]);
    if (typeof data.message === 'string' && data.message) return data.message;
    if (!error.response) return 'Tidak dapat terhubung ke server SisaPiring.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

const DEFAULT_CHECKLIST: FoodSafetyChecklist = {
  isFitForConsumption: true,
  isProperlyStored: true,
  isCleanPackaging: true,
  isNoAbnormalOdor: true,
  isAccurateInformation: true,
};

export interface RemoteUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  district?: string;
  defaultAddress?: string;
  merchant?: Record<string, unknown> | null;
}

function mapUser(raw: unknown): RemoteUser {
  const row = asRecord(raw);
  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    role: (row.role as RemoteUser['role']) || 'buyer',
    district: (row.district as string) || undefined,
    defaultAddress: (row.defaultAddress as string) || undefined,
    merchant: (row.merchant as Record<string, unknown> | null) ?? null,
  };
}

export interface AuthResult {
  user: RemoteUser;
  token: string;
}

export async function loginRemote(email: string, password: string): Promise<AuthResult> {
  const response = await api.post('/auth/login', { email, password });
  const result = { user: mapUser(response.data?.user), token: String(response.data?.token ?? '') };
  setAuthToken(result.token);
  return result;
}

export async function registerRemote(payload: Record<string, unknown>): Promise<AuthResult> {
  const response = await api.post('/auth/register', payload);
  const result = { user: mapUser(response.data?.user), token: String(response.data?.token ?? '') };
  setAuthToken(result.token);
  return result;
}

export async function fetchMe(): Promise<RemoteUser | null> {
  if (!readToken()) return null;
  const response = await api.get('/auth/me');
  return mapUser(response.data?.user);
}

export async function updateProfileRemote(updates: Record<string, unknown>): Promise<RemoteUser> {
  const response = await api.patch('/auth/profile', updates);
  return mapUser(response.data?.user);
}

export async function logoutRemote(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

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

function normalizeOrderStatus(raw: unknown): OrderStatus {
  const status = String(raw ?? 'waiting_confirmation');
  if (status === 'confirmed' || status === 'ready_for_pickup' || status === 'completed' || status === 'cancelled') {
    return status;
  }
  if (status === 'expired') return 'cancelled';
  return 'waiting_confirmation';
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
    status: normalizeOrderStatus(raw.status),
    statusHistory: Array.isArray(raw.statusHistory)
      ? (raw.statusHistory as Order['statusHistory'])
      : [],
    cancellationReason: (raw.cancellationReason as string) || undefined,
    isVerifiedByQR: Boolean(raw.isVerifiedByQR ?? false),
    verifiedAt: (raw.verifiedAt as string) || undefined,
  };
}

function mapMerchant(raw: Record<string, unknown>): SellerProfile {
  return {
    id: String(raw.id ?? ''),
    ownerName: String(raw.ownerName ?? ''),
    ownerPhone: String(raw.ownerPhone ?? ''),
    ownerEmail: String(raw.ownerEmail ?? ''),
    businessName: String(raw.businessName ?? ''),
    businessCategory: (raw.businessCategory as ProductCategory) || 'Bakery & Roti',
    businessAddress: String(raw.businessAddress ?? ''),
    district: (raw.district as SellerProfile['district']) || 'Coblong',
    businessPhoto: String(raw.businessPhoto ?? ''),
    businessDocumentName: String(raw.businessDocumentName ?? ''),
    verificationStatus: (raw.verificationStatus as VerificationStatus) || 'pending_review',
    verificationNotes: (raw.verificationNotes as string) || undefined,
    operatingHours: String(raw.operatingHours ?? '08:00 - 21:00 WIB'),
    pickupWindow: String(raw.pickupWindow ?? '17:00 - 21:00 WIB'),
    joinedDate: String(raw.joinedDate ?? ''),
    storeBio: String(raw.storeBio ?? ''),
    isOpenToday: Boolean(raw.isOpenToday ?? true),
  };
}

function productPayload(product: Partial<SisaPiringProduct>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (product.name !== undefined) payload.name = product.name;
  if (product.category !== undefined) payload.category = product.category;
  if (product.image !== undefined) payload.image = product.image;
  if (product.description !== undefined) payload.description = product.description;
  if (product.originalPrice !== undefined) payload.original_price = product.originalPrice;
  if (product.discountPercentage !== undefined) payload.discount_percentage = product.discountPercentage;
  if (product.stock !== undefined) payload.stock = product.stock;
  if (product.productionTime !== undefined) payload.production_time = product.productionTime;
  if (product.safeConsumptionDeadline !== undefined) payload.safe_consumption_deadline = product.safeConsumptionDeadline;
  if (product.pickupScheduleStart !== undefined) payload.pickup_schedule_start = product.pickupScheduleStart;
  if (product.pickupScheduleEnd !== undefined) payload.pickup_schedule_end = product.pickupScheduleEnd;
  if (product.storageInstruction !== undefined) payload.storage_instruction = product.storageInstruction;
  if (product.foodSafetyChecklist !== undefined) payload.food_safety_checklist = product.foodSafetyChecklist;
  if (product.isActive !== undefined) payload.is_active = product.isActive;
  return payload;
}

function merchantPayload(updates: Partial<SellerProfile>): Record<string, unknown> {
  const map: Record<string, string> = {
    ownerName: 'owner_name',
    ownerPhone: 'owner_phone',
    ownerEmail: 'owner_email',
    businessName: 'business_name',
    businessCategory: 'business_category',
    businessAddress: 'business_address',
    district: 'district',
    businessPhoto: 'business_photo',
    operatingHours: 'operating_hours',
    pickupWindow: 'pickup_window',
    storeBio: 'store_bio',
    isOpenToday: 'is_open_today',
  };
  const payload: Record<string, unknown> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (map[key] && value !== undefined) payload[map[key]] = value;
  });
  return payload;
}

export const apiClient = api;

export async function fetchCatalog(): Promise<SisaPiringItem[]> {
  const response = await api.get('/catalog');
  return unwrap<SisaPiringItem[]>(response.data);
}

export async function fetchProducts(): Promise<SisaPiringProduct[]> {
  const response = await api.get('/seller/products');
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapProduct);
}

export async function fetchCurrentMerchant(): Promise<SellerProfile> {
  const response = await api.get('/seller/merchant');
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get('/seller/orders');
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrder);
}

export async function createProductRemote(
  product: Omit<SisaPiringProduct, 'id' | 'createdAt' | 'portionsRescuedCount'>
): Promise<SisaPiringProduct> {
  const response = await api.post('/seller/products', productPayload(product));
  return mapProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function updateProductRemote(
  id: string,
  updates: Partial<SisaPiringProduct>
): Promise<SisaPiringProduct> {
  const response = await api.patch(`/seller/products/${id}`, productPayload(updates));
  return mapProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function deleteProductRemote(id: string): Promise<void> {
  await api.delete(`/seller/products/${id}`);
}

export async function updateProductStockRemote(id: string, stock: number): Promise<void> {
  await api.patch(`/seller/products/${id}/stock`, { stock });
}

export async function applyProductDiscountRemote(id: string, discount: number): Promise<void> {
  await api.patch(`/seller/products/${id}/discount`, { discount_percentage: discount });
}

export async function updateMerchantRemote(
  _id: string,
  updates: Partial<SellerProfile>
): Promise<SellerProfile> {
  const response = await api.patch('/seller/merchant', merchantPayload(updates));
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function createOrderRemote(
  items: { productId: string; quantity: number }[],
  customerName: string,
  customerPhone: string
): Promise<Order> {
  const response = await api.post('/buyer/order-groups', {
    items: items.map((item) => ({ product_code: item.productId, quantity: item.quantity })),
    customer_name: customerName,
    customer_phone: customerPhone,
  });
  const group = asRecord(unwrap<Record<string, unknown>>(response.data));
  const orders = Array.isArray(group.orders) ? group.orders : [];
  if (orders.length === 0) {
    throw new Error('Pesanan gagal dibuat.');
  }
  return mapOrder(asRecord(orders[0]));
}

export async function updateOrderStatusRemote(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const response = await api.patch(`/seller/orders/${orderId}/status`, { status, note });
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function cancelOrderRemote(orderId: string, reason: string): Promise<void> {
  await api.post(`/buyer/order-groups/${orderId}/cancel`, { reason });
}

export async function verifyOrderRemote(orderId: string, pickupCode?: string): Promise<Order> {
  const response = await api.post(`/seller/orders/${orderId}/verify`, {
    pickup_code: pickupCode,
  });
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

// ─── ADMIN API ────────────────────────────────────────────────────────────────

export interface AdminMerchant {
  id: string;             // code
  merchantId: number;
  ownerName: string;
  ownerPhone: string;
  businessName: string;
  businessCategory: string;
  businessAddress: string;
  district: string;
  businessPhoto: string | null;
  nibNumber: string | null;
  ktpMasked: string | null;
  halalOrPirtNumber: string | null;
  hygieneCommitmentSigned: boolean;
  verificationStatus: 'pending_review' | 'verified' | 'rejected';
  verificationNotes: string | null;
  rating: number;
  productsCount: number;
  joinedDate: string;
  suspendedReason?: string | null;
}

export interface AdminMerchantsResponse {
  data: AdminMerchant[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

export interface AdminProduct {
  id: string;             // code
  productId: number;
  name: string;
  category: string;
  image: string | null;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  stock: number;
  moderationStatus: 'active' | 'under_review' | 'taken_down';
  takedownReason: string | null;
  isActive: boolean;
  merchant: AdminMerchant | null;
  pickupScheduleStart: string;
  pickupScheduleEnd: string;
}

export interface AdminProductsResponse {
  data: AdminProduct[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
}

function mapAdminMerchant(raw: Record<string, unknown>): AdminMerchant {
  return {
    id: String(raw.id ?? ''),
    merchantId: Number(raw.merchantId ?? 0),
    ownerName: String(raw.ownerName ?? ''),
    ownerPhone: String(raw.ownerPhone ?? ''),
    businessName: String(raw.businessName ?? ''),
    businessCategory: String(raw.businessCategory ?? ''),
    businessAddress: String(raw.businessAddress ?? ''),
    district: String(raw.district ?? ''),
    businessPhoto: (raw.businessPhoto as string) || null,
    nibNumber: (raw.nibNumber as string) || null,
    ktpMasked: (raw.ktpMasked as string) || null,
    halalOrPirtNumber: (raw.halalOrPirtNumber as string) || null,
    hygieneCommitmentSigned: Boolean(raw.hygieneCommitmentSigned ?? false),
    verificationStatus: (raw.verificationStatus as AdminMerchant['verificationStatus']) || 'pending_review',
    verificationNotes: (raw.verificationNotes as string) || null,
    rating: Number(raw.rating ?? 0),
    productsCount: Number(raw.productsCount ?? 0),
    joinedDate: String(raw.joinedDate ?? ''),
    suspendedReason: (raw.suspendedReason as string) || null,
  };
}

function mapAdminProduct(raw: Record<string, unknown>): AdminProduct {
  return {
    id: String(raw.id ?? ''),
    productId: Number(raw.productId ?? 0),
    name: String(raw.name ?? ''),
    category: String(raw.category ?? ''),
    image: (raw.image as string) || null,
    originalPrice: Number(raw.originalPrice ?? 0),
    discountedPrice: Number(raw.discountedPrice ?? 0),
    discountPercentage: Number(raw.discountPercentage ?? 0),
    stock: Number(raw.stock ?? 0),
    moderationStatus: (raw.moderationStatus as AdminProduct['moderationStatus']) || 'active',
    takedownReason: (raw.takedownReason as string) || null,
    isActive: Boolean(raw.isActive ?? true),
    merchant: raw.merchant ? mapAdminMerchant(asRecord(raw.merchant)) : null,
    pickupScheduleStart: String(raw.pickupScheduleStart ?? ''),
    pickupScheduleEnd: String(raw.pickupScheduleEnd ?? ''),
  };
}

// ── Merchants ──────────────────────────────────────────────────────────────────

export async function fetchAdminMerchants(params?: {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<AdminMerchantsResponse> {
  const response = await api.get('/admin/merchants', { params });
  const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
  return {
    data: raw.data.map(mapAdminMerchant),
    meta: raw.meta as AdminMerchantsResponse['meta'],
  };
}

export async function fetchAdminMerchantDetail(code: string): Promise<AdminMerchant> {
  const response = await api.get(`/admin/merchants/${code}`);
  return mapAdminMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function verifyAdminMerchant(
  code: string,
  status: 'pending_review' | 'verified' | 'rejected',
  note?: string,
): Promise<AdminMerchant> {
  const response = await api.post(`/admin/merchants/${code}/verify`, { status, note });
  return mapAdminMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function suspendAdminMerchant(code: string, reason: string): Promise<AdminMerchant> {
  const response = await api.post(`/admin/merchants/${code}/suspend`, { reason });
  return mapAdminMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function reinstateAdminMerchant(code: string): Promise<AdminMerchant> {
  const response = await api.post(`/admin/merchants/${code}/reinstate`);
  return mapAdminMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

// ── Products ───────────────────────────────────────────────────────────────────

export async function fetchAdminProducts(params?: {
  status?: string;
  merchant?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<AdminProductsResponse> {
  const response = await api.get('/admin/products', { params });
  const raw = response.data as { data: Record<string, unknown>[]; meta: Record<string, unknown> };
  return {
    data: raw.data.map(mapAdminProduct),
    meta: raw.meta as AdminProductsResponse['meta'],
  };
}

export async function moderateAdminProduct(
  code: string,
  status: 'active' | 'under_review' | 'taken_down',
  reason?: string,
): Promise<AdminProduct> {
  const response = await api.post(`/admin/products/${code}/moderate`, { status, reason });
  return mapAdminProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
}
