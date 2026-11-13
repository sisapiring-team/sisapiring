import {
  SisaPiringItem,
  ComplaintReport,
} from '../../data/sisaPiringCatalog';
import { OrderRecord } from '../RescueModals';
import {
  UmkmVerificationRecord,
  UmkmVerificationStatus,
  ProductMonitoringMeta,
  ProductMonitoringStatus,
  AdminDisputeRecord,
  DisputeStatus,
  AdminTransactionRecord,
  DiscountHistoryEntry,
  UserAccessRecord,
  UserRole,
  AccountStatus,
  MacroPeriodStats,
} from '../../data/adminData';

export type AdminTab =
  | 'overview'
  | 'stores'
  | 'products'
  | 'orders'
  | 'complaints'
  | 'users'
  | 'seller-governance'
  | 'product-curation'
  | 'order-escrow'
  | 'disputes-refund'
  | 'reviews-moderation'
  | 'user-access';

export interface AdminMacroStats {
  period: MacroPeriodStats;
  totalOrdersCount: number;
  totalRescuedPortions: number;
  activeProductsCount: number;
  pendingUmkmCount: number;
  openDisputesCount: number;
  totalEscrowHeld: number;
}

