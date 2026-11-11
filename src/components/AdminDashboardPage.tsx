import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Store,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Search,
  SlidersHorizontal,
  Eye,
  ArrowUpRight,
  FileText,
  Users,
  Star,
  Clock,
  ExternalLink,
  X,
  Plus,
  Ban,
  TrendingUp,
  Leaf,
  Droplets,
  Coins,
  MessageSquare,
  Check,
  Receipt,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  SisaPiringItem,
  ComplaintReport,
  formatRupiah,
} from '../data/sisaPiringCatalog';
import { OrderRecord } from './RescueModals';
import { ResilientImage } from './ResilientImage';
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
  MACRO_IMPACT_BY_PERIOD,
} from '../data/adminData';
import { useApp } from '../context/AppContext';

export type AdminTab =
  | 'overview'
  | 'seller-governance'
  | 'product-curation'
  | 'order-escrow'
  | 'disputes-refund'
  | 'reviews-moderation'
  | 'user-access';

interface AdminDashboardPageProps {
  catalogItems: SisaPiringItem[];
  productMonitoring: Record<string, ProductMonitoringMeta>;
  umkmVerifications: UmkmVerificationRecord[];
  disputes: AdminDisputeRecord[];
  transactions: AdminTransactionRecord[];
  discountHistory: DiscountHistoryEntry[];
  userAccounts: UserAccessRecord[];
  orders: OrderRecord[];
  complaints: ComplaintReport[];
  onUpdateUmkmStatus: (
    id: string,
    status: UmkmVerificationStatus,
    notes: string
  ) => void;
  onAddSimulatedUmkm: (record: UmkmVerificationRecord) => void;
  onUpdateProductMonitoring: (
    itemId: string,
    status: ProductMonitoringStatus,
    reason?: string
  ) => void;
  onCorrectProductPrice: (
    itemId: string,
    correctedOriginalPrice: number,
    discountEntryId: string
  ) => void;
  onResolveDispute: (
    disputeId: string,
    nextStatus: DisputeStatus,
    resolutionNote: string,
    triggerRefund?: boolean,
    takedownItemName?: string
  ) => void;
  onUpdateTransactionGateway: (
    trxId: string,
    nextStatus: AdminTransactionRecord['gatewayStatus'],
    note: string
  ) => void;
  onUpdateUserAccess: (
    userId: string,
    nextRole: UserRole,
    nextStatus: AccountStatus,
    sanctionNote?: string
  ) => void;
  onAddUserAccount: (newUser: UserAccessRecord) => void;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
  onOpenPublicStore: (merchantName: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  catalogItems,
  productMonitoring,
  umkmVerifications,
  disputes,
  transactions,
  discountHistory,
  userAccounts,
  orders,
  complaints,
  onUpdateUmkmStatus,
  onAddSimulatedUmkm,
  onUpdateProductMonitoring,
  onCorrectProductPrice,
  onResolveDispute,
  onUpdateTransactionGateway,
  onUpdateUserAccess,
  onAddUserAccount,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
  onOpenPublicStore,
}) => {
  const { sellerProfile, products: sellerProducts, orders: liveSellerOrders } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'all' | UmkmVerificationStatus>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | ProductMonitoringStatus>('all');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<'all' | DisputeStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Interactive Modal States
  const [selectedUmkmModal, setSelectedUmkmModal] = useState<UmkmVerificationRecord | null>(null);
  const [takedownModalItem, setTakedownModalItem] = useState<SisaPiringItem | null>(null);
  const [takedownReasonText, setTakedownReasonText] = useState('Melanggar standar kesegaran & batas aman konsumsi (prep window).');
  const [selectedDisputeModal, setSelectedDisputeModal] = useState<AdminDisputeRecord | null>(null);
  const [disputeResolutionNote, setDisputeResolutionNote] = useState('Refund 100% diproses langsung ke rekening pembeli dari dana escrow platform.');
  const [priceCorrectionModalItem, setPriceCorrectionModalItem] = useState<DiscountHistoryEntry | null>(null);
  const [correctedPriceInput, setCorrectedPriceInput] = useState<number>(0);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Buyer');
  const [newUserDistrict, setNewUserDistrict] = useState('Coblong (Dago / Dipatiukur)');

  // Notification Toast State
  const [adminToast, setAdminToast] = useState<{ title: string; message: string } | null>(null);
  const showToast = (title: string, message: string) => {
    setAdminToast({ title, message });
    window.setTimeout(() => setAdminToast(null), 3500);
  };

  // Macro Metrics (Bandung Aggregates)
  const macroStats = useMemo(() => {
    const period = MACRO_IMPACT_BY_PERIOD['30d'];
    const totalOrdersCount = orders.length + transactions.length;
    const totalRescuedPortions = orders.reduce(
      (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
      period.totalPortionsRescued
    );
    const activeProductsCount = catalogItems.filter(
      (item) => (productMonitoring[item.id]?.monitoringStatus ?? 'Aktif & Aman') === 'Aktif & Aman'
    ).length;
    const pendingUmkmCount = umkmVerifications.filter((u) => u.status === 'Menunggu Verifikasi').length;
    const openDisputesCount = disputes.filter(
      (d) => d.status === 'Sedang Ditinjau' || d.status === 'Investigasi Mitra'
    ).length;
    const totalEscrowHeld = transactions
      .filter((t) => t.gatewayStatus === 'Dana Ditahan (Escrow)')
      .reduce((acc, t) => acc + t.totalPaid, 0);

    return {
      period,
      totalOrdersCount,
      totalRescuedPortions,
      activeProductsCount,
      pendingUmkmCount,
      openDisputesCount,
      totalEscrowHeld,
    };
  }, [orders, transactions, catalogItems, productMonitoring, umkmVerifications, disputes]);

  // Combined Seller Data (Syncing Kala Bakehouse with list)
  const displayUmkmList = useMemo(() => {
    return umkmVerifications.filter((u) => {
      if (sellerStatusFilter !== 'all' && u.status !== sellerStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.storeName.toLowerCase().includes(q) ||
          u.ownerName.toLowerCase().includes(q) ||
          u.district.toLowerCase().includes(q) ||
          u.nibNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [umkmVerifications, sellerStatusFilter, searchQuery]);

  // Combined Products (Catalog + Monitoring Status)
  const displayProducts = useMemo(() => {
    return catalogItems.filter((item) => {
      const meta = productMonitoring[item.id] || { monitoringStatus: 'Aktif & Aman' };
      if (productStatusFilter !== 'all' && meta.monitoringStatus !== productStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.merchantName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [catalogItems, productMonitoring, productStatusFilter, searchQuery]);

  // Combined Disputes & Complaints
  const displayDisputes = useMemo(() => {
    return disputes.filter((d) => {
      if (disputeStatusFilter !== 'all' && d.status !== disputeStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.ticketCode.toLowerCase().includes(q) ||
          d.orderCode.toLowerCase().includes(q) ||
          d.reporterName.toLowerCase().includes(q) ||
          d.merchantName.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [disputes, disputeStatusFilter, searchQuery]);

  // Filtered Users
  const displayUsers = useMemo(() => {
    return userAccounts.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [userAccounts, roleFilter, searchQuery]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Kecamatan,Porsi_Diselamatkan,Sampah_Dicegah_Kg,UMKM_Aktif,Tingkat_Partisipasi\n' +
      macroStats.period.districtStats
        .map(
          (d) =>
            `"${d.district}",${d.portionsRescued},${d.wasteReducedKg},${d.activeUmkm},"${d.participationRate}%"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_sisapiring_bandung_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Diunduh', 'Berkas CSV laporan makro Kota Bandung berhasil diunduh.');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 flex flex-col font-sans">
      {/* Toast Feedback */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16382C] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h5 className="font-bold text-xs">{adminToast.title}</h5>
            <p className="text-[11px] text-emerald-200">{adminToast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setAdminToast(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Governance Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#16382C] text-white border-b border-emerald-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand & Portal Role Identifier */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                    Pusat Tata Kelola Platform
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30 shrink-0">
                    Admin Console
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 truncate">
                  Penyelarasan Menu Konsumen (User) & Menu Mitra UMKM (Penjual) Bandung
                </p>
              </div>
            </div>

            {/* Quick Cross-Portal Switcher Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onSwitchToPublicEtalase}
                title="Buka Etalase Pembeli"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors border border-white/10"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Etalase Pembeli</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToSellerPortal}
                title="Buka Portal Mitra UMKM"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors border border-emerald-500/30"
              >
                <Store className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Portal Penjual</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu (Aligned to User & Seller Needs) */}
        <div className="bg-[#122e24] border-t border-emerald-950/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2">
            {[
              { id: 'overview', label: 'Ringkasan & Dampak', icon: TrendingUp },
              { id: 'seller-governance', label: 'Mitra UMKM (Sisi Penjual)', icon: Store, badge: macroStats.pendingUmkmCount },
              { id: 'product-curation', label: 'Menu & Keamanan Pangan', icon: PackageCheck },
              { id: 'order-escrow', label: 'Pesanan & Escrow', icon: Receipt },
              { id: 'disputes-refund', label: 'Komplain & Refund (Sisi User)', icon: AlertTriangle, badge: macroStats.openDisputesCount, badgeColor: 'bg-rose-500' },
              { id: 'reviews-moderation', label: 'Ulasan & Kepuasan', icon: Star },
              { id: 'user-access', label: 'Manajemen Akun (RBAC)', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as AdminTab);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'border-amber-400 text-white bg-white/5 font-bold'
                      : 'border-transparent text-emerald-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-emerald-300/70'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${
                        tab.badgeColor || 'bg-amber-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ========================================================
            TAB 1: RINGKASAN EKOSISTEM & DAMPAK MAKRO
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Welcome & Ecosystem Health Banner */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Kota Bandung • Real-Time
                  </span>
                  <span className="text-xs text-neutral-400">Periode: {macroStats.period.periodLabel}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-1">
                  Pusat Pengawasan Ekosistem SisaPiring
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Sinkronisasi menyeluruh antara transaksi konsumen, katalog sisa piring mitra UMKM, dan kepatuhan standar higienitas.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor Laporan CSV</span>
                </button>
              </div>
            </div>

            {/* 6 Key Macro Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Porsi Diselamatkan</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl font-black font-mono text-[#16382C]">
                  {macroStats.totalRescuedPortions.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block">+12.4% minggu ini</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Sampah Pangan Dicegah</span>
                  <Leaf className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl font-black font-mono text-neutral-900">
                  {macroStats.period.foodWastePreventedKg.toLocaleString('id-ID')} <span className="text-xs">kg</span>
                </div>
                <span className="text-[10px] text-neutral-500 block">TPA Sarimukti</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Reduksi Gas CO2e</span>
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-xl font-black font-mono text-emerald-800">
                  {macroStats.period.co2EmissionsSavedKg.toLocaleString('id-ID')} <span className="text-xs">kg</span>
                </div>
                <span className="text-[10px] text-neutral-500 block">Gas Metana Tercegah</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Air Bersih Terlindungi</span>
                  <Droplets className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-xl font-black font-mono text-sky-800">
                  {macroStats.period.waterSavedLiters.toLocaleString('id-ID')} <span className="text-xs">L</span>
                </div>
                <span className="text-[10px] text-neutral-500 block">Virtual Water Footprint</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Omzet UMKM Pulih</span>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-black font-mono text-[#16382C]">
                  {formatRupiah(macroStats.period.umkmRevenueRecovered)}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block">Dipulihkan ke Pedagang</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-semibold">Dana Escrow Aktif</span>
                  <Receipt className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-black font-mono text-indigo-900">
                  {formatRupiah(macroStats.totalEscrowHeld)}
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold block">Terlindungi Pembeli</span>
              </div>
            </div>

            {/* Ecosystem Balance Grid: User Needs vs Seller Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Sisi Mitra UMKM (Penjual) */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">Sisi Mitra UMKM (Penjual)</h3>
                      <p className="text-[11px] text-neutral-500">Legalitas, prep window, dan pelepasan dana penjualan</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seller-governance')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Kelola Mitra</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Mitra Aktif & Terverifikasi
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {umkmVerifications.filter((u) => u.status === 'Verified').length} Gerai Resmi di 5 Kecamatan
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Sesuai Standar
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Pengajuan KYB Menunggu Review
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {macroStats.pendingUmkmCount} UMKM baru mendaftar NIB & Halal
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('seller-governance');
                        setSellerStatusFilter('Menunggu Verifikasi');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Tinjau Sekarang
                    </button>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Menu Sisa Piring Tayang
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {macroStats.activeProductsCount} menu dalam pengawasan prep window
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('product-curation')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Buka Kurasi
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Sisi Konsumen (Pembeli) */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">Sisi Konsumen (Pembeli)</h3>
                      <p className="text-[11px] text-neutral-500">Pesanan, kepuasan ulasan, dan jaminan refund komplain</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('disputes-refund')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Pusat Komplain</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Pesanan Masuk & Serah Terima
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {macroStats.totalOrdersCount} pesanan konsumen telah terintegrasi
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('order-escrow')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Cek Pesanan
                    </button>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Tiket Komplain & Proteksi Refund
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {macroStats.openDisputesCount} tiket membutuhkan resolusi cepat
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        macroStats.openDisputesCount > 0
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {macroStats.openDisputesCount > 0 ? 'Perlu Ditindak' : 'Semua Beres'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Indeks Kepuasan Konsumen
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Rata-rata 4.8 / 5.0 dari ulasan pembeli Bandung
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reviews-moderation')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Buka Ulasan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* District Breakdown Table */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">
                    Sebaran Penyelamatan Pangan Per Kecamatan di Kota Bandung
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Memantau serapan konsumsi warga dan kontribusi UMKM di wilayah Bandung
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-3">Kecamatan</th>
                      <th className="py-3 px-3">Porsi Diselamatkan</th>
                      <th className="py-3 px-3">Sampah Dicegah</th>
                      <th className="py-3 px-3">Reduksi CO2</th>
                      <th className="py-3 px-3">Air Bersih</th>
                      <th className="py-3 px-3">Mitra Aktif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {macroStats.period.districtStats.map((d) => (
                      <tr key={d.district} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-neutral-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{d.district}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#16382C]">
                          {d.portionsRescued.toLocaleString('id-ID')} porsi
                        </td>
                        <td className="py-3 px-3 font-mono">{d.wasteReducedKg.toLocaleString('id-ID')} kg</td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                          {Math.round(d.portionsRescued * 0.45).toLocaleString('id-ID')} kg
                        </td>
                        <td className="py-3 px-3 font-mono text-sky-700">
                          {Math.round(d.portionsRescued * 62).toLocaleString('id-ID')} L
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          {d.activeUmkm} Gerai <span className="text-[10px] text-neutral-400">({d.participationRate}%)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: TATA KELOLA MITRA UMKM (SISI PENJUAL)
        ======================================================== */}
        {activeTab === 'seller-governance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Tata Kelola Mitra UMKM (Kebutuhan Penjual)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verifikasi legalitas NIB, sertifikasi Halal / PIRT, komitmen higienitas dapur, dan kontrol status toko.
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari toko, NIB, pemilik..."
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
                  />
                </div>

                <select
                  value={sellerStatusFilter}
                  onChange={(e) => setSellerStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold"
                >
                  <option value="all">Semua Status</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Verified">Verified (Resmi)</option>
                  <option value="Ditolak">Ditolak / Perbaikan</option>
                  <option value="Suspended">Suspended (Dibekukan)</option>
                </select>
              </div>
            </div>

            {/* Active Store Focus Banner (Kala Bakehouse) */}
            <div className="bg-[#16382C] text-white p-5 rounded-3xl border border-emerald-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 font-bold shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {sellerProfile.businessName} (Toko Demo Aktif)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-neutral-950">
                      Sinkron Portal Seller
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Pemilik: {sellerProfile.ownerName} • Wilayah: Kec. {sellerProfile.district} • Operasional:{' '}
                    {sellerProfile.pickupWindow}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenPublicStore(sellerProfile.businessName)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Lihat Profil Publik
                </button>
                <button
                  type="button"
                  onClick={onSwitchToSellerPortal}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Buka di Portal Penjual
                </button>
              </div>
            </div>

            {/* List of Registered UMKM Partners */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Nama Gerai UMKM</th>
                      <th className="py-3 px-4">Pemilik & Kontak</th>
                      <th className="py-3 px-4">Legalitas (NIB / Halal)</th>
                      <th className="py-3 px-4">Lokasi Bandung</th>
                      <th className="py-3 px-4">Status Verifikasi</th>
                      <th className="py-3 px-4 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {displayUmkmList.map((umkm) => (
                      <tr key={umkm.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <ResilientImage
                              src={umkm.storePhotoUrl}
                              alt={umkm.storeName}
                              className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-neutral-900 block text-xs">
                                {umkm.storeName}
                              </span>
                              <span className="text-[11px] text-neutral-400 block">{umkm.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-800 block">{umkm.ownerName}</span>
                          <span className="text-[11px] text-neutral-500 block font-mono">{umkm.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-neutral-800 font-bold block text-[11px]">
                            NIB: {umkm.nibNumber}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold block">
                            Halal: {umkm.halalOrPirtNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-neutral-800 block">{umkm.district}</span>
                          <span className="text-[11px] text-neutral-400 block line-clamp-1">{umkm.address}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              umkm.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : umkm.status === 'Menunggu Verifikasi'
                                ? 'bg-amber-100 text-amber-800'
                                : umkm.status === 'Suspended'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {umkm.status === 'Verified' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                            {umkm.status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-700" />}
                            {umkm.status === 'Suspended' && <Ban className="w-3 h-3 text-rose-700" />}
                            <span>{umkm.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedUmkmModal(umkm)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Tinjau Legalitas</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: KURASI MENU & KEAMANAN PANGAN (SISI PENJUAL & USER)
        ======================================================== */}
        {activeTab === 'product-curation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Kurasi Menu & Keamanan Pangan (Sisi Penjual & User)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Awasi seluruh menu sisa piring yang diunggah UMKM. Nonaktifkan (Take Down) produk bermasalah secara instan dari etalase pembeli.
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari menu, mitra, kategori..."
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
                  />
                </div>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold"
                >
                  <option value="all">Semua Status Menu</option>
                  <option value="Aktif & Aman">Aktif & Aman (Tayang)</option>
                  <option value="Dalam Tinjauan">Dalam Tinjauan</option>
                  <option value="Take Down">Take Down (Dinonaktifkan)</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Menu Sisa Piring</th>
                      <th className="py-3 px-4">Mitra UMKM</th>
                      <th className="py-3 px-4">Harga Normal vs Hemat</th>
                      <th className="py-3 px-4">Stok Porsi</th>
                      <th className="py-3 px-4">Batas Konsumsi (Prep Window)</th>
                      <th className="py-3 px-4">Status Pengawasan</th>
                      <th className="py-3 px-4 text-right">Aksi Kontrol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {displayProducts.map((item) => {
                      const meta = productMonitoring[item.id] || {
                        monitoringStatus: 'Aktif & Aman',
                        reportCount: 0,
                      };
                      const isTakenDown = meta.monitoringStatus === 'Take Down';

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-neutral-50/70 transition-colors ${
                            isTakenDown ? 'bg-rose-50/40 opacity-80' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ResilientImage
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-11 h-11 rounded-xl object-cover border border-neutral-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-neutral-900 block text-xs line-clamp-1">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-neutral-400 block">ID: {item.id} • {item.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-neutral-800 block text-xs">{item.merchantName}</span>
                            <span className="text-[11px] text-neutral-500 block">Kec. {item.district}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold font-mono text-[#16382C] text-xs">
                                {formatRupiah(item.rescuePrice)}
                              </span>
                              <span className="line-through text-neutral-400 font-mono text-[11px]">
                                {formatRupiah(item.originalPrice)}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#EE4D2D]">
                              Diskon {item.discountPercent}% OFF
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold font-mono text-neutral-900 text-xs">
                              {item.remainingStock} porsi
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-neutral-700">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="font-semibold text-[11px]">{item.pickupWindow}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                meta.monitoringStatus === 'Aktif & Aman'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : meta.monitoringStatus === 'Dalam Tinjauan'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {meta.monitoringStatus === 'Aktif & Aman' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                              {meta.monitoringStatus === 'Take Down' && <AlertTriangle className="w-3 h-3 text-rose-700" />}
                              <span>{meta.monitoringStatus}</span>
                            </span>
                            {meta.reportCount > 0 && (
                              <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                                {meta.reportCount}x Laporan Pembeli
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isTakenDown ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateProductMonitoring(item.id, 'Aktif & Aman');
                                  showToast('Produk Dipulihkan', `"${item.title}" kembali tayang di etalase.`);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Pulihkan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setTakedownModalItem(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-rose-200"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                                <span>Take Down</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: MONITORING PESANAN & ESCROW (SISI USER & PENJUAL)
        ======================================================== */}
        {activeTab === 'order-escrow' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Monitoring Pesanan & Rekening Escrow Platform
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Dana konsumen tertahan aman di rekening bersama (escrow) hingga verifikasi serah terima paket makanan via QR Code.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode pesanan, pembeli, toko..."
                  className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-64"
                />
              </div>
            </div>

            {/* Escrow Health Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-500">Total Transaksi Dipantau</span>
                <div className="text-xl font-black font-mono text-neutral-900">
                  {transactions.length + orders.length} Pesanan
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block">Real-time sinkron</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-500">Dana Tertahan di Escrow</span>
                <div className="text-xl font-black font-mono text-amber-700">
                  {formatRupiah(macroStats.totalEscrowHeld)}
                </div>
                <span className="text-[11px] text-amber-600 font-semibold block">Menunggu verifikasi serah terima QR</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-500">Pencairan Dana (Settled)</span>
                <div className="text-xl font-black font-mono text-[#16382C]">
                  {formatRupiah(
                    transactions
                      .filter((t) => t.gatewayStatus === 'Selesai (Settled)')
                      .reduce((acc, t) => acc + t.totalPaid, 0)
                  )}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block">Telah cair ke dompet UMKM</span>
              </div>
            </div>

            {/* Unified Orders & Escrow Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Kode Pesanan / Waktu</th>
                      <th className="py-3 px-4">Pembeli (User)</th>
                      <th className="py-3 px-4">Mitra UMKM (Penjual)</th>
                      <th className="py-3 px-4">Menu & Porsi</th>
                      <th className="py-3 px-4">Total Bayar & Metode</th>
                      <th className="py-3 px-4">Status Rekening Escrow</th>
                      <th className="py-3 px-4 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {transactions
                      .filter((trx) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          trx.orderCode.toLowerCase().includes(q) ||
                          trx.buyerName.toLowerCase().includes(q) ||
                          trx.merchantName.toLowerCase().includes(q)
                        );
                      })
                      .map((trx) => (
                        <tr key={trx.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-neutral-900 block text-xs">
                              {trx.orderCode}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">{trx.timestamp}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-neutral-800 block text-xs">{trx.buyerName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-neutral-800 block text-xs">{trx.merchantName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-neutral-900 font-semibold block text-xs line-clamp-1">
                              {trx.quantity}x {trx.itemTitle}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold font-mono text-[#16382C] block text-xs">
                              {formatRupiah(trx.totalPaid)}
                            </span>
                            <span className="text-[10px] text-neutral-500 block">{trx.paymentMethod}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                trx.gatewayStatus === 'Selesai (Settled)'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : trx.gatewayStatus === 'Dana Ditahan (Escrow)'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {trx.gatewayStatus === 'Selesai (Settled)' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                              {trx.gatewayStatus === 'Dana Ditahan (Escrow)' && <Clock className="w-3 h-3 text-amber-700" />}
                              <span>{trx.gatewayStatus}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {trx.gatewayStatus === 'Dana Ditahan (Escrow)' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateTransactionGateway(
                                    trx.id,
                                    'Selesai (Settled)',
                                    'Dilepaskan secara manual oleh Admin setelah audit serah terima barang.'
                                  );
                                  showToast('Escrow Dicairkan', `Dana pesanan ${trx.orderCode} diteruskan ke UMKM.`);
                                }}
                                className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              >
                                Lepaskan Dana
                              </button>
                            ) : (
                              <span className="text-[11px] text-neutral-400 font-medium">Beres</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PUSAT KOMPLAIN & REFUND (SISI USER)
        ======================================================== */}
        {activeTab === 'disputes-refund' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Pusat Komplain & Garansi Refund Escrow (Kebutuhan User)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Laporan pembeli atas makanan basi, porsi tidak sesuai, atau toko tutup saat penjemputan. Lindungi pembeli dengan refund 100%.
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tiket, nama, masalah..."
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
                  />
                </div>

                <select
                  value={disputeStatusFilter}
                  onChange={(e) => setDisputeStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold"
                >
                  <option value="all">Semua Status Tiket</option>
                  <option value="Sedang Ditinjau">Sedang Ditinjau</option>
                  <option value="Investigasi Mitra">Investigasi Mitra</option>
                  <option value="Selesai (Refund Pembeli)">Selesai (Refund)</option>
                  <option value="Ditolak (Bukti Tidak Valid)">Ditolak</option>
                </select>
              </div>
            </div>

            {/* Disputes Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayDisputes.map((dispute) => {
                const isPending =
                  dispute.status === 'Sedang Ditinjau' || dispute.status === 'Investigasi Mitra';

                return (
                  <div
                    key={dispute.id}
                    className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-4 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md">
                            #{dispute.ticketCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dispute.severity.includes('Kritis')
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {dispute.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900 mt-1.5">
                          {dispute.category}
                        </h4>
                        <span className="text-[11px] text-neutral-500">
                          Pesanan {dispute.orderCode} • Menu: {dispute.itemName}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-500">Pelapor:</span>
                        <span className="font-bold text-neutral-800">{dispute.reporterName} ({dispute.reporterPhone})</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-500">Mitra UMKM:</span>
                        <span className="font-semibold text-neutral-800">{dispute.merchantName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-500">Nominal Transaksi:</span>
                        <span className="font-mono font-bold text-[#16382C]">{formatRupiah(dispute.amountPaid)}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200/60 text-neutral-700 text-[11px] leading-relaxed">
                        <strong className="text-neutral-900">Uraian Komplain:</strong> "{dispute.description}"
                      </div>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedDisputeModal(dispute)}
                          className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#EE4D2D] hover:bg-[#D73C1C] text-white transition-colors shadow-xs"
                        >
                          Eksekusi Solusi & Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResolveDispute(
                              dispute.id,
                              'Ditolak (Bukti Tidak Valid)',
                              'Bukti tidak memenuhi kriteria komplain garansi mutu makanan.'
                            );
                            showToast('Laporan Ditolak', `Tiket #${dispute.ticketCode} ditutup.`);
                          }}
                          className="px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium">
                        ✓ Catatan Resolusi: {dispute.adminResolutionNote || 'Selesai.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: ULASAN & KEPUASAN PELANGGAN (SISI USER & PENJUAL)
        ======================================================== */}
        {activeTab === 'reviews-moderation' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Ulasan & Kepuasan Pelanggan (Sisi User & Penjual)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pantau rating bintang dan testimoni pembeli Bandung untuk menjaga reputasi mutu makanan sisa piring.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Rata-rata Platform: 4.8 / 5.0
                </span>
              </div>
            </div>

            {/* Customer Reviews Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'rev-1',
                  buyer: 'Siti Nurhaliza',
                  store: 'Kala Bakehouse & Artisan Cafe',
                  product: 'Artisan Butter Croissant & Pain au Chocolat',
                  rating: 5,
                  date: 'Hari ini, 18:30 WIB',
                  comment: 'Croissant masih renyah banget pas dihangatkan! Beli jam 6 sore hemat 60%, rasa butter premium tetap terasa mewah.',
                  tags: ['Masih Hangat & Segar', 'Sesuai Deskripsi'],
                },
                {
                  id: 'rev-2',
                  buyer: 'Dimas Prasetyo',
                  store: 'Dapur Bu Siti Sunda Asli',
                  product: 'Nasi Liwet Komplit Ayam Bakar Madu',
                  rating: 5,
                  date: 'Kemarin, 20:15 WIB',
                  comment: 'Porsi katering event bersih dan tertutup rapat. Nasi liwetnya wangi, sambal lalap masih segar!',
                  tags: ['Porsi Pas', 'Kemasan Rapi'],
                },
                {
                  id: 'rev-3',
                  buyer: 'Angga Wijaya',
                  store: 'Kala Bakehouse & Artisan Cafe',
                  product: 'Rustic Sourdough Loaf Gandum Utuh',
                  rating: 4,
                  date: '2 hari lalu',
                  comment: 'Sourdough bagus, renyah dan empuk di dalam. Cocok untuk sarapan keluarga hemat.',
                  tags: ['Sesuai Deskripsi'],
                },
              ].map((rev) => (
                <div key={rev.id} className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#16382C] text-white flex items-center justify-center font-bold text-xs">
                        {rev.buyer[0]}
                      </div>
                      <div>
                        <span className="font-bold text-neutral-900 block text-xs">{rev.buyer}</span>
                        <span className="text-[10px] text-neutral-400 block">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-neutral-800 block text-[11px] truncate">
                      {rev.store}
                    </span>
                    <span className="text-neutral-500 text-[10px] block truncate">{rev.product}</span>
                    <p className="text-neutral-700 text-xs italic mt-1">"{rev.comment}"</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-md border border-emerald-100"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: MANAJEMEN AKUN & RBAC (PENGGUNA PLATFORM)
        ======================================================== */}
        {activeTab === 'user-access' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Manajemen Akun & Hak Akses (RBAC)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Daftar akun konsumen (buyer), mitra UMKM (seller), dan admin platform Kota Bandung.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16382C] hover:bg-[#214F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Akun Demo</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Nama Pengguna</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Wilayah Kecamatan</th>
                      <th className="py-3 px-4">Status Akun</th>
                      <th className="py-3 px-4 text-right">Kontrol Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {displayUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900 block text-xs">{u.name}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono">{u.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-neutral-800 block text-xs">{u.email}</span>
                          <span className="text-[11px] text-neutral-500 block font-mono">{u.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'Admin'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'UMKM'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-800">{u.district}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'Peringatan (Warning)'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {u.status === 'Aktif' ? (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateUserAccess(u.id, u.role, 'Suspended', 'Dibekukan oleh Admin');
                                showToast('Akun Dibekukan', `Akun ${u.name} dinonaktifkan.`);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200"
                            >
                              Bekukan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateUserAccess(u.id, u.role, 'Aktif');
                                showToast('Akun Dipulihkan', `Akun ${u.name} aktif kembali.`);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                            >
                              Aktifkan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODALS SECTION (INTERACTIVE DIALOGS)
      ======================================================== */}

      {/* 1. Modal Tinjau & Verifikasi KYB UMKM */}
      {selectedUmkmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-base text-neutral-900">
                  Verifikasi Legalitas & KYB Mitra
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUmkmModal(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <ResilientImage
                  src={selectedUmkmModal.storePhotoUrl}
                  alt={selectedUmkmModal.storeName}
                  className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-900">{selectedUmkmModal.storeName}</h4>
                  <p className="text-neutral-500">Pemilik: {selectedUmkmModal.ownerName} • {selectedUmkmModal.phone}</p>
                  <p className="text-neutral-500">Kec. {selectedUmkmModal.district} • {selectedUmkmModal.address}</p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-2xl space-y-2 border border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nomor Induk Berusaha (NIB):</span>
                  <span className="font-mono font-bold text-neutral-900">{selectedUmkmModal.nibNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sertifikasi Halal / PIRT:</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedUmkmModal.halalOrPirtNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Verifikasi KTP Pemilik:</span>
                  <span className="font-mono text-neutral-800">{selectedUmkmModal.ktpMasked}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60">
                  <span className="text-neutral-500">Deklarasi Higienitas Dapur:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ✓ Bertandatangan Digital
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  onUpdateUmkmStatus(selectedUmkmModal.id, 'Ditolak', 'Dokumen belum lengkap / perlu pembaharuan.');
                  showToast('Verifikasi Ditolak', `Status ${selectedUmkmModal.storeName} diubah.`);
                  setSelectedUmkmModal(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
              >
                Minta Perbaikan
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateUmkmStatus(selectedUmkmModal.id, 'Verified', 'Semua berkas legalitas dan uji higienitas disetujui.');
                  showToast('Mitra Disetujui', `${selectedUmkmModal.storeName} resmi berstatus Verified.`);
                  setSelectedUmkmModal(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#16382C] hover:bg-[#214F3F] text-white transition-colors"
              >
                Setujui Menjadi Mitra Resmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Take Down Menu Bermasalah */}
      {takedownModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-neutral-900">Konfirmasi Take Down Menu</h3>
                <p className="text-xs text-neutral-500">Produk akan langsung dicabut dari etalase pembeli</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-neutral-900 block">{takedownModalItem.title}</span>
              <span className="text-neutral-500 block">{takedownModalItem.merchantName}</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">Alasan Resmi Penarikan Produk:</label>
              <textarea
                value={takedownReasonText}
                onChange={(e) => setTakedownReasonText(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakedownModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateProductMonitoring(takedownModalItem.id, 'Take Down', takedownReasonText);
                  showToast('Produk Di-Takedown', `"${takedownModalItem.title}" dinonaktifkan dari etalase.`);
                  setTakedownModalItem(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Eksekusi Take Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Eksekusi Solusi Komplain & Refund Escrow */}
      {selectedDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-neutral-900">
                  Resolusi Tiket #{selectedDisputeModal.ticketCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDisputeModal(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl text-xs space-y-1.5 border border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Pelapor:</span>
                <span className="font-bold text-neutral-900">{selectedDisputeModal.reporterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Toko Terkait:</span>
                <span className="font-semibold text-neutral-800">{selectedDisputeModal.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nominal Refund Escrow:</span>
                <span className="font-mono font-bold text-emerald-800">{formatRupiah(selectedDisputeModal.amountPaid)}</span>
              </div>
              <p className="pt-2 border-t border-neutral-200/60 text-neutral-700 italic">
                "{selectedDisputeModal.description}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">Catatan Resmi Admin & Rekomendasi Solusi:</label>
              <textarea
                value={disputeResolutionNote}
                onChange={(e) => setDisputeResolutionNote(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onResolveDispute(
                    selectedDisputeModal.id,
                    'Selesai (Refund Pembeli)',
                    disputeResolutionNote,
                    true,
                    selectedDisputeModal.itemName
                  );
                  showToast('Refund Berhasil', `Dana ${formatRupiah(selectedDisputeModal.amountPaid)} dikembalikan ke pembeli.`);
                  setSelectedDisputeModal(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                Proses Refund 100% Escrow
              </button>

              <button
                type="button"
                onClick={() => {
                  onResolveDispute(
                    selectedDisputeModal.id,
                    'Selesai (Sanksi UMKM)',
                    'Sanksi peringatan diterbitkan ke gerai terkait.',
                    false
                  );
                  showToast('Sanksi Diterbitkan', `Peringatan dikirim ke ${selectedDisputeModal.merchantName}.`);
                  setSelectedDisputeModal(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
              >
                Kirim Sanksi Mitra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Tambah Akun Demo Baru */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900">Tambah Akun Pengguna Demo</h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Peran (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="Buyer">Buyer (Konsumen)</option>
                    <option value="UMKM">UMKM (Penjual)</option>
                    <option value="Admin">Admin Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Wilayah Kecamatan</label>
                  <input
                    type="text"
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newUserName.trim()) return;
                  onAddUserAccount({
                    id: `usr-${Date.now().toString().slice(-4)}`,
                    name: newUserName,
                    email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '')}@sisapiring.id`,
                    phone: newUserPhone || '+62 812-8899-7711',
                    role: newUserRole,
                    status: 'Aktif',
                    district: newUserDistrict,
                    joinedAt: 'Hari ini',
                    lastActive: 'Baru saja',
                    violationCount: 0,
                  });
                  showToast('Akun Ditambahkan', `Akun ${newUserName} berhasil dibuat.`);
                  setIsAddUserModalOpen(false);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPhone('');
                }}
                className="px-4 py-2 text-xs font-bold bg-[#16382C] hover:bg-[#214F3F] text-white rounded-xl shadow-xs"
              >
                Simpan Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
