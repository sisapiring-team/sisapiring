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

// ==========================================
// TYPE DEFINITIONS & CONTRACTS
// ==========================================

export interface RemoteUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  accountStatus?: 'active' | 'warning' | 'suspended';
  violationCount?: number;
  district?: string;
  defaultAddress?: string;
  avatar?: string;
  createdAt?: string;
  merchant?: Record<string, unknown> | null;
}

export interface AuthResult {
  user: RemoteUser;
  token: string;
}

export interface ApiOrder extends Order {
  orderId?: number;
  groupId?: number;
  groupCode?: string;
  totalOriginalPrice?: number;
  totalDiscount?: number;
  paymentStatus?: string;
  qrCodeToken?: string;
  merchant?: Partial<SellerProfile>;
}

export interface OrderGroup {
  id: string; // group_code e.g. SPG-261114-XXXX
  groupId: number;
  subtotal: number;
  platformFee: number;
  discountTotal: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  expiresAt?: string;
  paidAt?: string;
  buyerNote?: string;
  createdAt?: string;
  orders?: ApiOrder[];
  payment?: PaymentRecord;
  user?: RemoteUser;
}

export interface PaymentRecord {
  id: number;
  provider: string;
  method?: string;
  status: string;
  amount: number;
  currency: string;
  externalId?: string;
  paymentUrl?: string;
  expiresAt?: string;
  paidAt?: string;
  isMock?: boolean;
}

export interface ReviewRecord {
  id: number;
  orderId: number;
  orderItemId: number;
  rating: number;
  comment: string;
  tags?: string[];
  moderationStatus?: 'pending' | 'published' | 'flagged' | 'hidden';
  flagReason?: string;
  adminReply?: string;
  merchantReply?: string;
  merchantRepliedAt?: string;
  createdAt?: string;
  reviewer?: { id: number; name: string };
  merchant?: { id: string; businessName: string };
  product?: { id: string; name: string };
}

export interface DisputeRecord {
  id: number;
  ticketCode: string;
  orderId: number;
  orderItemId?: number;
  category: string;
  description: string;
  evidencePath?: string;
  severity?: string;
  status: string;
  resolutionType?: string;
  resolutionNote?: string;
  refundAmount?: number;
  resolvedAt?: string;
  createdAt?: string;
  reporter?: { id: number; name: string };
  merchant?: { id: string; businessName: string };
  order?: { id: string; status?: string; totalPayment?: number };
  messages?: DisputeMessageRecord[];
}

export interface DisputeMessageRecord {
  id: number;
  type: string;
  body: string;
  attachmentPath?: string;
  metadata?: Record<string, unknown>;
  readAt?: string;
  sender?: { id?: number; name?: string; role?: string };
  createdAt?: string;
}

export interface ConversationRecord {
  id: number;
  buyer?: { id: number; name: string };
  merchant?: { id: string; businessName: string };
  orderId?: number;
  lastMessageAt?: string;
  createdAt?: string;
  messages?: ChatMessageRecord[];
}

export interface ChatMessageRecord {
  id: number;
  type: string;
  body: string;
  attachmentPath?: string;
  metadata?: Record<string, unknown>;
  readAt?: string;
  sender?: { id?: number; name?: string; role?: string };
  createdAt?: string;
}

export interface NotificationRecord {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at?: string;
}

export interface ImpactTotals {
  portions: number;
  weight_kg: number;
  co2_kg: number;
  methane_kg: number;
  water_liters: number;
  money_saved: number;
}

export interface ImpactSummary {
  totals: ImpactTotals;
  daily: { date: string; portions: number; co2_kg: number }[];
  recent?: Record<string, unknown>[];
}

export interface SellerDashboardStats {
  merchant: {
    id: string;
    businessName: string;
    rating: number;
    verificationStatus?: string;
  };
  stats: {
    revenue: number;
    orders: number;
    activeProducts: number;
    resolvedImpact: ImpactTotals;
  };
  ordersByStatus: Record<string, number>;
  recentOrders: ApiOrder[];
  lowStock: {
    id: string;
    name: string;
    stock: number;
    lockedStock: number;
  }[];
}

export interface AdminDashboardStats {
  stats: {
    users: number;
    buyers: number;
    sellers: number;
    merchantsPending: number;
    merchantsVerified: number;
    productsUnderReview: number;
    orders: number;
    revenue: number;
    openDisputes: number;
    impact: ImpactTotals;
  };
  recentOrders: ApiOrder[];
}

export interface MerchantDocumentRecord {
  id: number;
  docType: string;
  filePath: string;
  status: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

// ==========================================
// MAPPERS
// ==========================================

function mapUser(raw: unknown): RemoteUser {
  const row = asRecord(raw);
  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    role: (row.role as RemoteUser['role']) || 'buyer',
    accountStatus: (row.accountStatus as RemoteUser['accountStatus']) || 'active',
    violationCount: Number(row.violationCount ?? 0),
    district: (row.district as string) || undefined,
    defaultAddress: (row.defaultAddress as string) || undefined,
    avatar: (row.avatar as string) || undefined,
    createdAt: (row.createdAt as string) || undefined,
    merchant: (row.merchant as Record<string, unknown> | null) ?? null,
  };
}

function mapProduct(raw: Record<string, unknown>): SisaPiringProduct {
  return {
    id: String(raw.id ?? raw.code ?? ''),
    name: String(raw.name ?? ''),
    category: (raw.category as ProductCategory) || 'Bakery & Roti',
    image: (raw.image as string) || '',
    originalPrice: Number(raw.originalPrice ?? raw.original_price ?? 0),
    discountPercentage: Number(raw.discountPercentage ?? raw.discount_percentage ?? 50) as SisaPiringProduct['discountPercentage'],
    discountedPrice: Number(raw.discountedPrice ?? raw.discounted_price ?? 0),
    stock: Number(raw.stock ?? 0),
    productionTime: (raw.productionTime as string) || (raw.production_time as string) || 'Hari ini',
    safeConsumptionDeadline: (raw.safeConsumptionDeadline as string) || (raw.safe_consumption_deadline as string) || 'Hari ini',
    safeDeadlineTimestamp: Number(raw.safeDeadlineTimestamp ?? (raw.safe_deadline_at ? new Date(String(raw.safe_deadline_at)).getTime() : Date.now() + 3 * 60 * 60 * 1000)),
    pickupScheduleStart: (raw.pickupScheduleStart as string) || (raw.pickup_schedule_start as string) || '17:00 WIB',
    pickupScheduleEnd: (raw.pickupScheduleEnd as string) || (raw.pickup_schedule_end as string) || '21:00 WIB',
    storageInstruction: ((raw.storageInstruction as string) || (raw.storage_instruction as string) || 'Suhu Ruang (Kering & Sejuk)') as StorageInstruction,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    foodSafetyChecklist: (raw.foodSafetyChecklist as FoodSafetyChecklist) || (raw.food_safety_checklist as FoodSafetyChecklist) || DEFAULT_CHECKLIST,
    description: (raw.description as string) || '',
    portionsRescuedCount: Number(raw.portionsRescuedCount ?? raw.portions_rescued_count ?? 0),
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
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

function mapOrder(raw: Record<string, unknown>): ApiOrder {
  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    id: String(raw.id ?? raw.order_code ?? ''),
    orderId: raw.orderId ? Number(raw.orderId) : raw.id ? Number(raw.id) : undefined,
    groupId: raw.groupId ? Number(raw.groupId) : raw.order_group_id ? Number(raw.order_group_id) : undefined,
    groupCode: (raw.groupCode as string) || (raw.group_code as string) || undefined,
    pickupCode: String(raw.pickupCode ?? raw.pickup_code ?? ''),
    customerName: String(raw.customerName ?? raw.customer_name ?? ''),
    customerPhone: String(raw.customerPhone ?? raw.customer_phone ?? ''),
    items: items.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        productId: String(row.productId ?? row.product_id ?? ''),
        productName: String(row.productName ?? row.product_name ?? ''),
        category: (row.category as ProductCategory) || 'Bakery & Roti',
        pricePerItem: Number(row.pricePerItem ?? row.price_per_item ?? 0),
        quantity: Number(row.quantity ?? 1),
        image: (row.image as string) || '',
      };
    }),
    totalPayment: Number(raw.totalPayment ?? raw.total_payment ?? 0),
    totalOriginalPrice: raw.totalOriginalPrice ? Number(raw.totalOriginalPrice) : undefined,
    totalDiscount: raw.totalDiscount ? Number(raw.totalDiscount) : undefined,
    paymentStatus: (raw.paymentStatus as string) || (raw.payment_status as string) || undefined,
    orderDate: (raw.orderDate as string) || (raw.created_at as string) || '',
    pickupDeadline: (raw.pickupDeadline as string) || (raw.pickup_deadline as string) || '',
    status: normalizeOrderStatus(raw.status),
    statusHistory: Array.isArray(raw.statusHistory)
      ? (raw.statusHistory as Order['statusHistory'])
      : Array.isArray(raw.status_history)
      ? (raw.status_history as Order['statusHistory'])
      : [],
    cancellationReason: (raw.cancellationReason as string) || (raw.cancellation_reason as string) || undefined,
    isVerifiedByQR: Boolean(raw.isVerifiedByQR ?? raw.is_verified_by_qr ?? false),
    verifiedAt: (raw.verifiedAt as string) || (raw.verified_at as string) || undefined,
    qrCodeToken: (raw.qrCodeToken as string) || (raw.qr_code_token as string) || undefined,
    merchant: raw.merchant ? mapMerchant(asRecord(raw.merchant)) : undefined,
  };
}

function mapMerchant(raw: Record<string, unknown>): SellerProfile {
  return {
    id: String(raw.id ?? raw.code ?? ''),
    ownerName: String(raw.ownerName ?? raw.owner_name ?? ''),
    ownerPhone: String(raw.ownerPhone ?? raw.owner_phone ?? ''),
    ownerEmail: String(raw.ownerEmail ?? raw.owner_email ?? ''),
    businessName: String(raw.businessName ?? raw.business_name ?? ''),
    businessCategory: (raw.businessCategory as ProductCategory) || (raw.business_category as ProductCategory) || 'Bakery & Roti',
    businessAddress: String(raw.businessAddress ?? raw.business_address ?? ''),
    district: (raw.district as SellerProfile['district']) || 'Coblong',
    businessPhoto: String(raw.businessPhoto ?? raw.business_photo ?? ''),
    businessDocumentName: String(raw.businessDocumentName ?? raw.business_document_name ?? ''),
    verificationStatus: (raw.verificationStatus as VerificationStatus) || (raw.verification_status as VerificationStatus) || 'pending_review',
    verificationNotes: (raw.verificationNotes as string) || (raw.verification_notes as string) || undefined,
    operatingHours: String(raw.operatingHours ?? raw.operating_hours ?? '08:00 - 21:00 WIB'),
    pickupWindow: String(raw.pickupWindow ?? raw.pickup_window ?? '17:00 - 21:00 WIB'),
    joinedDate: String(raw.joinedDate ?? raw.created_at ?? ''),
    storeBio: String(raw.storeBio ?? raw.store_bio ?? ''),
    isOpenToday: Boolean(raw.isOpenToday ?? raw.is_open_today ?? true),
  };
}

function mapOrderGroup(raw: Record<string, unknown>): OrderGroup {
  const orders = Array.isArray(raw.orders) ? (raw.orders as Record<string, unknown>[]).map(mapOrder) : [];
  return {
    id: String(raw.id ?? raw.group_code ?? ''),
    groupId: Number(raw.groupId ?? raw.id ?? 0),
    subtotal: Number(raw.subtotal ?? 0),
    platformFee: Number(raw.platformFee ?? raw.platform_fee ?? 0),
    discountTotal: Number(raw.discountTotal ?? raw.discount_total ?? 0),
    grandTotal: Number(raw.grandTotal ?? raw.grand_total ?? 0),
    status: String(raw.status ?? ''),
    paymentStatus: String(raw.paymentStatus ?? raw.payment_status ?? ''),
    expiresAt: (raw.expiresAt as string) || (raw.expires_at as string) || undefined,
    paidAt: (raw.paidAt as string) || (raw.paid_at as string) || undefined,
    buyerNote: (raw.buyerNote as string) || (raw.buyer_note as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
    orders,
    payment: raw.payment ? mapPayment(asRecord(raw.payment)) : undefined,
    user: raw.user ? mapUser(raw.user) : undefined,
  };
}

function mapPayment(raw: Record<string, unknown>): PaymentRecord {
  return {
    id: Number(raw.id ?? 0),
    provider: String(raw.provider ?? 'xendit'),
    method: (raw.method as string) || undefined,
    status: String(raw.status ?? 'unpaid'),
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? 'IDR'),
    externalId: (raw.externalId as string) || (raw.external_id as string) || undefined,
    paymentUrl: (raw.paymentUrl as string) || (raw.payment_url as string) || undefined,
    expiresAt: (raw.expiresAt as string) || (raw.expires_at as string) || undefined,
    paidAt: (raw.paidAt as string) || (raw.paid_at as string) || undefined,
    isMock: Boolean(raw.isMock ?? raw.is_mock ?? false),
  };
}

function mapReview(raw: Record<string, unknown>): ReviewRecord {
  return {
    id: Number(raw.id ?? 0),
    orderId: Number(raw.orderId ?? raw.order_id ?? 0),
    orderItemId: Number(raw.orderItemId ?? raw.order_item_id ?? 0),
    rating: Number(raw.rating ?? 5),
    comment: String(raw.comment ?? ''),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    moderationStatus: (raw.moderationStatus as ReviewRecord['moderationStatus']) || (raw.moderation_status as ReviewRecord['moderationStatus']) || 'published',
    flagReason: (raw.flagReason as string) || (raw.flag_reason as string) || undefined,
    adminReply: (raw.adminReply as string) || (raw.admin_reply as string) || undefined,
    merchantReply: (raw.merchantReply as string) || (raw.merchant_reply as string) || undefined,
    merchantRepliedAt: (raw.merchantRepliedAt as string) || (raw.merchant_replied_at as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
    reviewer: raw.reviewer ? (raw.reviewer as { id: number; name: string }) : undefined,
    merchant: raw.merchant ? (raw.merchant as { id: string; businessName: string }) : undefined,
    product: raw.product ? (raw.product as { id: string; name: string }) : undefined,
  };
}

function mapDispute(raw: Record<string, unknown>): DisputeRecord {
  const messages = Array.isArray(raw.messages)
    ? (raw.messages as Record<string, unknown>[]).map(mapDisputeMessage)
    : [];
  return {
    id: Number(raw.id ?? 0),
    ticketCode: String(raw.ticketCode ?? raw.ticket_code ?? ''),
    orderId: Number(raw.orderId ?? raw.order_id ?? 0),
    orderItemId: raw.orderItemId ? Number(raw.orderItemId) : raw.order_item_id ? Number(raw.order_item_id) : undefined,
    category: String(raw.category ?? ''),
    description: String(raw.description ?? ''),
    evidencePath: (raw.evidencePath as string) || (raw.evidence_path as string) || undefined,
    severity: (raw.severity as string) || undefined,
    status: String(raw.status ?? 'open'),
    resolutionType: (raw.resolutionType as string) || (raw.resolution_type as string) || undefined,
    resolutionNote: (raw.resolutionNote as string) || (raw.resolution_note as string) || undefined,
    refundAmount: raw.refundAmount ? Number(raw.refundAmount) : raw.refund_amount ? Number(raw.refund_amount) : undefined,
    resolvedAt: (raw.resolvedAt as string) || (raw.resolved_at as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
    reporter: raw.reporter ? (raw.reporter as { id: number; name: string }) : undefined,
    merchant: raw.merchant ? (raw.merchant as { id: string; businessName: string }) : undefined,
    order: raw.order ? (raw.order as { id: string; status?: string; totalPayment?: number }) : undefined,
    messages,
  };
}

function mapDisputeMessage(raw: Record<string, unknown>): DisputeMessageRecord {
  return {
    id: Number(raw.id ?? 0),
    type: String(raw.type ?? 'text'),
    body: String(raw.body ?? ''),
    attachmentPath: (raw.attachmentPath as string) || (raw.attachment_path as string) || undefined,
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    readAt: (raw.readAt as string) || (raw.read_at as string) || undefined,
    sender: raw.sender ? (raw.sender as { id?: number; name?: string; role?: string }) : undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
  };
}

function mapConversation(raw: Record<string, unknown>): ConversationRecord {
  const messages = Array.isArray(raw.messages)
    ? (raw.messages as Record<string, unknown>[]).map(mapChatMessage)
    : [];
  return {
    id: Number(raw.id ?? 0),
    buyer: raw.buyer ? (raw.buyer as { id: number; name: string }) : undefined,
    merchant: raw.merchant ? (raw.merchant as { id: string; businessName: string }) : undefined,
    orderId: raw.orderId ? Number(raw.orderId) : raw.order_id ? Number(raw.order_id) : undefined,
    lastMessageAt: (raw.lastMessageAt as string) || (raw.last_message_at as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
    messages,
  };
}

function mapChatMessage(raw: Record<string, unknown>): ChatMessageRecord {
  return {
    id: Number(raw.id ?? 0),
    type: String(raw.type ?? 'text'),
    body: String(raw.body ?? ''),
    attachmentPath: (raw.attachmentPath as string) || (raw.attachment_path as string) || undefined,
    metadata: (raw.metadata as Record<string, unknown>) || undefined,
    readAt: (raw.readAt as string) || (raw.read_at as string) || undefined,
    sender: raw.sender ? (raw.sender as { id?: number; name?: string; role?: string }) : undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || undefined,
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

// ==========================================
// 1. AUTH & USER PROFILE & NOTIFICATIONS
// ==========================================

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

export async function changePasswordRemote(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await api.post('/auth/password', payload);
}

export async function logoutRemote(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

export async function fetchNotifications(params?: { per_page?: number }): Promise<NotificationRecord[]> {
  const response = await api.get('/notifications', { params });
  return unwrap<NotificationRecord[]>(response.data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}

export async function markNotificationRead(id: string | number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

// ==========================================
// 2. PUBLIC MARKETPLACE & PLATFORM ENDPOINTS
// ==========================================

export async function fetchCatalog(params?: Record<string, unknown>): Promise<SisaPiringItem[]> {
  const response = await api.get('/catalog', { params });
  return unwrap<SisaPiringItem[]>(response.data);
}

export async function fetchCatalogCategories(): Promise<string[]> {
  const response = await api.get('/catalog/categories');
  return unwrap<string[]>(response.data);
}

export async function fetchCatalogProduct(code: string): Promise<Record<string, unknown>> {
  const response = await api.get(`/catalog/${code}`);
  return unwrap<Record<string, unknown>>(response.data);
}

export async function fetchPublicMerchants(params?: Record<string, unknown>): Promise<SellerProfile[]> {
  const response = await api.get('/merchants', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapMerchant);
}

export async function fetchPublicMerchant(code: string): Promise<SellerProfile> {
  const response = await api.get(`/merchants/${code}`);
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchPublicImpact(): Promise<ImpactSummary> {
  const response = await api.get('/impact');
  return response.data as ImpactSummary;
}

// ==========================================
// 3. CONVERSATIONS & AI RESCUE BOT
// ==========================================

export async function fetchConversations(params?: { per_page?: number }): Promise<ConversationRecord[]> {
  const response = await api.get('/conversations', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapConversation);
}

export async function createConversation(payload: {
  merchant_code: string;
  order_id?: number;
  message?: string;
}): Promise<ConversationRecord> {
  const response = await api.post('/conversations', payload);
  return mapConversation(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchConversation(id: number | string): Promise<ConversationRecord> {
  const response = await api.get(`/conversations/${id}`);
  return mapConversation(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function sendChatMessage(
  conversationId: number | string,
  payload: { body: string; type?: string; attachment_path?: string }
): Promise<ChatMessageRecord> {
  const response = await api.post(`/conversations/${conversationId}/messages`, payload);
  return mapChatMessage(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function markChatRead(conversationId: number | string): Promise<void> {
  await api.post(`/conversations/${conversationId}/read`);
}

export async function fetchAssistantConversations(): Promise<unknown[]> {
  const response = await api.get('/assistant/conversations');
  return unwrap<unknown[]>(response.data);
}

export async function sendAssistantChat(payload: {
  message: string;
  conversation_id?: number;
}): Promise<{ reply: string; conversation_id: number }> {
  const response = await api.post('/assistant/chat', payload);
  return response.data as { reply: string; conversation_id: number };
}

export async function deleteAssistantConversation(id: number | string): Promise<void> {
  await api.delete(`/assistant/conversations/${id}`);
}

// ==========================================
// 4. BUYER MARKETPLACE FLOW
// ==========================================

export async function fetchBuyerOrderGroups(params?: {
  status?: string;
  per_page?: number;
}): Promise<OrderGroup[]> {
  const response = await api.get('/buyer/order-groups', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrderGroup);
}

export async function createOrderGroup(payload: {
  items: { product_code: string; quantity: number }[];
  customer_name?: string;
  customer_phone?: string;
  delivery_type?: string;
  buyer_note?: string;
  notes?: string;
}): Promise<OrderGroup> {
  const response = await api.post('/buyer/order-groups', {
    items: payload.items,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    buyer_note: payload.buyer_note || payload.notes,
  });
  return mapOrderGroup(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerOrderGroup(groupCode: string): Promise<OrderGroup> {
  const response = await api.get(`/buyer/order-groups/${groupCode}`);
  return mapOrderGroup(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function cancelBuyerOrderGroup(groupCode: string, reason: string): Promise<OrderGroup> {
  const response = await api.post(`/buyer/order-groups/${groupCode}/cancel`, { reason });
  return mapOrderGroup(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function payBuyerOrderGroup(groupCode: string): Promise<{ payment: PaymentRecord; paymentUrl?: string }> {
  const response = await api.post(`/buyer/order-groups/${groupCode}/pay`);
  const data = asRecord(unwrap<Record<string, unknown>>(response.data));
  return {
    payment: mapPayment(data),
    paymentUrl: (response.data?.paymentUrl as string) || undefined,
  };
}

export async function fetchBuyerOrders(params?: {
  status?: string;
  per_page?: number;
}): Promise<ApiOrder[]> {
  const response = await api.get('/buyer/orders', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrder);
}

export async function fetchBuyerOrder(orderCode: string): Promise<ApiOrder> {
  const response = await api.get(`/buyer/orders/${orderCode}`);
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerPayment(paymentId: number | string): Promise<PaymentRecord> {
  const response = await api.get(`/buyer/payments/${paymentId}`);
  return mapPayment(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function mockPayPayment(paymentId: number | string): Promise<PaymentRecord> {
  const response = await api.post(`/buyer/payments/${paymentId}/mock-pay`);
  return mapPayment(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerReviews(params?: { per_page?: number }): Promise<ReviewRecord[]> {
  const response = await api.get('/buyer/reviews', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapReview);
}

export async function createBuyerReview(payload: {
  order_item_id: number;
  rating: number;
  comment?: string;
  tags?: string[];
}): Promise<ReviewRecord> {
  const response = await api.post('/buyer/reviews', payload);
  return mapReview(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function updateBuyerReview(
  reviewId: number | string,
  payload: { rating?: number; comment?: string; tags?: string[] }
): Promise<ReviewRecord> {
  const response = await api.patch(`/buyer/reviews/${reviewId}`, payload);
  return mapReview(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerDisputes(params?: {
  status?: string;
  per_page?: number;
}): Promise<DisputeRecord[]> {
  const response = await api.get('/buyer/disputes', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapDispute);
}

export async function createBuyerDispute(payload: {
  order_id: number;
  order_item_id?: number;
  category: string;
  description: string;
  evidence_path?: string;
}): Promise<DisputeRecord> {
  const response = await api.post('/buyer/disputes', payload);
  return mapDispute(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerDispute(id: number | string): Promise<DisputeRecord> {
  const response = await api.get(`/buyer/disputes/${id}`);
  return mapDispute(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function sendBuyerDisputeReply(
  disputeId: number | string,
  payload: { body: string; attachment_path?: string }
): Promise<DisputeMessageRecord> {
  const response = await api.post(`/buyer/disputes/${disputeId}/messages`, payload);
  return mapDisputeMessage(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchBuyerImpact(): Promise<ImpactSummary> {
  const response = await api.get('/buyer/impact');
  return response.data as ImpactSummary;
}

// ==========================================
// 5. SELLER PORTAL FLOW
// ==========================================

export async function fetchSellerDashboardStats(): Promise<SellerDashboardStats> {
  const response = await api.get('/seller/dashboard');
  const data = response.data as Record<string, unknown>;
  const recentOrders = Array.isArray(data.recentOrders)
    ? (data.recentOrders as Record<string, unknown>[]).map(mapOrder)
    : [];

  return {
    merchant: data.merchant as SellerDashboardStats['merchant'],
    stats: data.stats as SellerDashboardStats['stats'],
    ordersByStatus: (data.ordersByStatus as Record<string, number>) || {},
    recentOrders,
    lowStock: (data.lowStock as SellerDashboardStats['lowStock']) || [],
  };
}

export async function fetchCurrentMerchant(): Promise<SellerProfile> {
  const response = await api.get('/seller/merchant');
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function updateMerchantRemote(
  _id: string,
  updates: Partial<SellerProfile>
): Promise<SellerProfile> {
  const response = await api.patch('/seller/merchant', merchantPayload(updates));
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function uploadMerchantDocument(
  docType: string,
  file: File
): Promise<MerchantDocumentRecord> {
  const formData = new FormData();
  formData.append('doc_type', docType);
  formData.append('file', file);
  const response = await api.post('/seller/merchant/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<MerchantDocumentRecord>(response.data);
}

export async function submitMerchantVerification(): Promise<SellerProfile> {
  const response = await api.post('/seller/merchant/submit-verification');
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchProducts(params?: {
  q?: string;
  status?: string;
  low_stock?: boolean;
  per_page?: number;
}): Promise<SisaPiringProduct[]> {
  const response = await api.get('/seller/products', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapProduct);
}

export async function fetchProduct(code: string): Promise<SisaPiringProduct> {
  const response = await api.get(`/seller/products/${code}`);
  return mapProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
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

export async function toggleProductActiveRemote(code: string): Promise<SisaPiringProduct> {
  const response = await api.patch(`/seller/products/${code}/toggle-active`);
  return mapProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchOrders(params?: {
  status?: string;
  q?: string;
  per_page?: number;
}): Promise<ApiOrder[]> {
  const response = await api.get('/seller/orders', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrder);
}

export async function fetchOrder(orderCode: string): Promise<ApiOrder> {
  const response = await api.get(`/seller/orders/${orderCode}`);
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function updateOrderStatusRemote(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<ApiOrder> {
  const response = await api.patch(`/seller/orders/${orderId}/status`, { status, note });
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function verifyOrderRemote(
  orderId: string,
  pickupCode?: string,
  qrToken?: string
): Promise<ApiOrder> {
  const payload: Record<string, unknown> = {};
  if (pickupCode) payload.pickup_code = pickupCode;
  if (qrToken) payload.qr_token = qrToken;
  const response = await api.post(`/seller/orders/${orderId}/verify`, payload);
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchSellerReviews(params?: {
  rating?: number;
  unreplied?: boolean;
  per_page?: number;
}): Promise<ReviewRecord[]> {
  const response = await api.get('/seller/reviews', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapReview);
}

export async function replySellerReview(
  reviewId: number | string,
  reply: string
): Promise<ReviewRecord> {
  const response = await api.post(`/seller/reviews/${reviewId}/reply`, { reply });
  return mapReview(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchSellerDisputes(params?: {
  status?: string;
  per_page?: number;
}): Promise<DisputeRecord[]> {
  const response = await api.get('/seller/disputes', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapDispute);
}

export async function fetchSellerDispute(id: number | string): Promise<DisputeRecord> {
  const response = await api.get(`/seller/disputes/${id}`);
  return mapDispute(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function sendSellerDisputeReply(
  disputeId: number | string,
  payload: { body: string; attachment_path?: string }
): Promise<DisputeMessageRecord> {
  const response = await api.post(`/seller/disputes/${disputeId}/messages`, payload);
  return mapDisputeMessage(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

// ==========================================
// 6. ADMIN PLATFORM GOVERNANCE FLOW
// ==========================================

export async function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  const response = await api.get('/admin/dashboard');
  const data = response.data as Record<string, unknown>;
  const recentOrders = Array.isArray(data.recentOrders)
    ? (data.recentOrders as Record<string, unknown>[]).map(mapOrder)
    : [];

  return {
    stats: data.stats as AdminDashboardStats['stats'],
    recentOrders,
  };
}

export async function fetchAdminMerchants(params?: {
  status?: string;
  q?: string;
  per_page?: number;
}): Promise<SellerProfile[]> {
  const response = await api.get('/admin/merchants', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapMerchant);
}

export async function fetchAdminMerchant(code: string): Promise<SellerProfile> {
  const response = await api.get(`/admin/merchants/${code}`);
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function verifyAdminMerchant(
  code: string,
  payload: { status: 'verified' | 'rejected' | 'pending_review'; note?: string }
): Promise<SellerProfile> {
  const response = await api.post(`/admin/merchants/${code}/verify`, payload);
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function suspendAdminMerchant(code: string, reason: string): Promise<SellerProfile> {
  const response = await api.post(`/admin/merchants/${code}/suspend`, { reason });
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function reinstateAdminMerchant(code: string): Promise<SellerProfile> {
  const response = await api.post(`/admin/merchants/${code}/reinstate`);
  return mapMerchant(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchAdminProducts(params?: {
  status?: string;
  merchant?: string;
  q?: string;
  per_page?: number;
}): Promise<SisaPiringProduct[]> {
  const response = await api.get('/admin/products', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapProduct);
}

export async function moderateAdminProduct(
  code: string,
  payload: { status: 'active' | 'under_review' | 'taken_down'; reason?: string }
): Promise<SisaPiringProduct> {
  const response = await api.post(`/admin/products/${code}/moderate`, payload);
  return mapProduct(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchAdminOrderGroups(params?: {
  payment_status?: string;
  per_page?: number;
}): Promise<OrderGroup[]> {
  const response = await api.get('/admin/orders/groups', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrderGroup);
}

export async function fetchAdminOrders(params?: {
  status?: string;
  payment_status?: string;
  merchant?: string;
  q?: string;
  per_page?: number;
}): Promise<ApiOrder[]> {
  const response = await api.get('/admin/orders', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapOrder);
}

export async function fetchAdminOrder(orderCode: string): Promise<ApiOrder> {
  const response = await api.get(`/admin/orders/${orderCode}`);
  return mapOrder(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchAdminDisputes(params?: {
  status?: string;
  q?: string;
  per_page?: number;
}): Promise<DisputeRecord[]> {
  const response = await api.get('/admin/disputes', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapDispute);
}

export async function fetchAdminDispute(id: number | string): Promise<DisputeRecord> {
  const response = await api.get(`/admin/disputes/${id}`);
  return mapDispute(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function resolveAdminDispute(
  id: number | string,
  payload: {
    status: 'resolved_refund' | 'resolved_sanction' | 'rejected';
    resolution_type?: string;
    resolution_note: string;
    refund_amount?: number;
  }
): Promise<DisputeRecord> {
  const response = await api.post(`/admin/disputes/${id}/resolve`, payload);
  return mapDispute(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchAdminReviews(params?: {
  status?: string;
  merchant?: string;
  per_page?: number;
}): Promise<ReviewRecord[]> {
  const response = await api.get('/admin/reviews', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapReview);
}

export async function moderateAdminReview(
  reviewId: number | string,
  payload: { status: 'published' | 'flagged' | 'hidden'; reason?: string; admin_reply?: string }
): Promise<ReviewRecord> {
  const response = await api.post(`/admin/reviews/${reviewId}/moderate`, payload);
  return mapReview(asRecord(unwrap<Record<string, unknown>>(response.data)));
}

export async function fetchAdminUsers(params?: {
  role?: string;
  status?: string;
  q?: string;
  per_page?: number;
}): Promise<RemoteUser[]> {
  const response = await api.get('/admin/users', { params });
  const rows = unwrap<Record<string, unknown>[]>(response.data);
  return rows.map(mapUser);
}

export async function createAdminUser(payload: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  district?: string;
  default_address?: string;
  role: 'buyer' | 'seller' | 'admin';
  status?: 'active' | 'suspended';
}): Promise<RemoteUser> {
  const response = await api.post('/admin/users', payload);
  return mapUser(unwrap<Record<string, unknown>>(response.data));
}

export async function updateAdminUserStatus(
  userId: number | string,
  payload: { status: 'active' | 'warning' | 'suspended'; note?: string }
): Promise<RemoteUser> {
  const response = await api.patch(`/admin/users/${userId}/status`, payload);
  return mapUser(unwrap<Record<string, unknown>>(response.data));
}

// ==========================================
// 7. COMPATIBILITY ALIASES
// ==========================================

export async function createOrderRemote(
  items: { productId: string; quantity: number }[],
  customerName: string,
  customerPhone: string
): Promise<ApiOrder> {
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

export async function cancelOrderRemote(orderId: string, reason: string): Promise<void> {
  await api.post(`/buyer/order-groups/${orderId}/cancel`, { reason });
}
