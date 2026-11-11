import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Store,
  PackageCheck,
  ShieldAlert,
  Receipt,
  Users,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Eye,
  RotateCcw,
  Download,
  ArrowUpRight,
  FileText,
  Lock,
  Unlock,
  SlidersHorizontal,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';
import {
  SurplusItem,
  ComplaintReport,
  formatRupiah,
} from '../data/surplusCatalog';
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

export type AdminModuleTab =
  | 'macro-impact'
  | 'seller-verification'
  | 'product-monitoring'
  | 'report-management'
  | 'transaction-monitoring'
  | 'access-control';

interface AdminDashboardPageProps {
  catalogItems: SurplusItem[];
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
  onUpdateUmkmStatus,
  onAddSimulatedUmkm,
  onUpdateProductMonitoring,
  onCorrectProductPrice,
  onResolveDispute,
  onUpdateTransactionGateway,
  onUpdateUserAccess,
  onAddUserAccount,
  onSwitchToPublicEtalase,
  onOpenPublicStore,
}) => {
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('macro-impact');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Module 1: Seller Verification State
  const [umkmFilter, setUmkmFilter] = useState<'Semua' | UmkmVerificationStatus>('Semua');
  const [umkmSearch, setUmkmSearch] = useState('');
  const [selectedUmkmModal, setSelectedUmkmModal] = useState<UmkmVerificationRecord | null>(null);
  const [umkmNoteInput, setUmkmNoteInput] = useState('');
  const [showAddUmkmModal, setShowAddUmkmModal] = useState(false);
  const [newUmkmStore, setNewUmkmStore] = useState('');
  const [newUmkmOwner, setNewUmkmOwner] = useState('');
  const [newUmkmCategory, setNewUmkmCategory] = useState('Roti, Kue & Pastry');
  const [newUmkmDistrict, setNewUmkmDistrict] = useState('Coblong (Dago / Dipatiukur)');
  const [newUmkmNib, setNewUmkmNib] = useState('');

  // Module 2: Product Monitoring State
  const [productFilter, setProductFilter] = useState<'Semua' | ProductMonitoringStatus>('Semua');
  const [productSearch, setProductSearch] = useState('');
  const [takedownModalItem, setTakedownModalItem] = useState<SurplusItem | null>(null);
  const [takedownReasonInput, setTakedownReasonInput] = useState(
    'Laporan Ketidaksesuaian Standar Keamanan Pangan / Risiko Basi'
  );
  const [takedownCustomNote, setTakedownCustomNote] = useState('');

  // Module 3: Report Management (Dispute Resolution) State
  const [disputeFilter, setDisputeFilter] = useState<'Semua' | 'Aktif' | 'Selesai'>('Semua');
  const [disputeSearch, setDisputeSearch] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeRecord | null>(null);
  const [disputeNoteInput, setDisputeNoteInput] = useState('');
  const [disputeAutoTakedown, setDisputeAutoTakedown] = useState(false);

  // Module 4: Transaction & Anti-Manipulation State
  const [trxSubTab, setTrxSubTab] = useState<'transactions' | 'discount-history'>('transactions');
  const [trxFilter, setTrxFilter] = useState<'Semua' | 'Anomali' | 'Escrow' | 'Refunded'>('Semua');
  const [trxSearch, setTrxSearch] = useState('');

  // Module 5: Account Access Control State
  const [roleFilter, setRoleFilter] = useState<'Semua' | UserRole>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | AccountStatus>('Semua');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<UserAccessRecord | null>(null);
  const [editUserRole, setEditUserRole] = useState<UserRole>('Buyer');
  const [editUserStatus, setEditUserStatus] = useState<AccountStatus>('Aktif');
  const [editUserSanction, setEditUserSanction] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('UMKM');

  // Module 6: Macro Impact Dashboard State
  const [macroPeriod, setMacroPeriod] = useState<'7d' | '30d' | 'quarter' | 'all'>('30d');

  const showToast = (msg: string) => {
    setAdminNotice(msg);
    window.setTimeout(() => {
      setAdminNotice((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Counts for Sidebar Navigation
  const pendingUmkmCount = useMemo(
    () => umkmVerifications.filter((u) => u.status === 'Menunggu Verifikasi').length,
    [umkmVerifications]
  );

  const flaggedProductCount = useMemo(
    () =>
      Object.values(productMonitoring).filter(
        (m) => m.monitoringStatus !== 'Aktif & Aman'
      ).length,
    [productMonitoring]
  );

  const openDisputesCount = useMemo(
    () =>
      disputes.filter(
        (d) => d.status === 'Sedang Ditinjau' || d.status === 'Investigasi Mitra'
      ).length,
    [disputes]
  );

  const anomalyTrxCount = useMemo(
    () =>
      transactions.filter((t) => t.manipulationFlag !== 'Aman').length +
      discountHistory.filter((d) => d.status === 'Peringatan Manipulasi Harga').length,
    [transactions, discountHistory]
  );

  const suspendedUsersCount = useMemo(
    () => userAccounts.filter((u) => u.status !== 'Aktif').length,
    [userAccounts]
  );

  // Filtered Lists
  const filteredUmkmList = useMemo(() => {
    return umkmVerifications.filter((u) => {
      const matchStatus = umkmFilter === 'Semua' || u.status === umkmFilter;
      const q = umkmSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        u.storeName.toLowerCase().includes(q) ||
        u.ownerName.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q) ||
        u.nibNumber.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [umkmVerifications, umkmFilter, umkmSearch]);

  const filteredProducts = useMemo(() => {
    return catalogItems.filter((item) => {
      const meta = productMonitoring[item.id] || {
        itemId: item.id,
        monitoringStatus: 'Aktif & Aman',
        reportCount: 0,
        safetyFlag: 'Aman',
        prepWindowVerified: true,
        lastCheckedAt: 'Hari ini',
      };
      const matchStatus =
        productFilter === 'Semua' || meta.monitoringStatus === productFilter;
      const q = productSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.merchantName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [catalogItems, productMonitoring, productFilter, productSearch]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const isActive =
        d.status === 'Sedang Ditinjau' || d.status === 'Investigasi Mitra';
      const matchStatus =
        disputeFilter === 'Semua' ||
        (disputeFilter === 'Aktif' && isActive) ||
        (disputeFilter === 'Selesai' && !isActive);
      const q = disputeSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        d.ticketCode.toLowerCase().includes(q) ||
        d.orderCode.toLowerCase().includes(q) ||
        d.merchantName.toLowerCase().includes(q) ||
        d.reporterName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [disputes, disputeFilter, disputeSearch]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchFilter =
        trxFilter === 'Semua' ||
        (trxFilter === 'Anomali' && t.manipulationFlag !== 'Aman') ||
        (trxFilter === 'Escrow' && t.gatewayStatus === 'Dana Ditahan (Escrow)') ||
        (trxFilter === 'Refunded' &&
          (t.gatewayStatus === 'Refunded' || t.gatewayStatus === 'Dibatalkan'));
      const q = trxSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.orderCode.toLowerCase().includes(q) ||
        t.merchantName.toLowerCase().includes(q) ||
        t.buyerName.toLowerCase().includes(q) ||
        t.paymentGatewayRef.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [transactions, trxFilter, trxSearch]);

  const filteredUsers = useMemo(() => {
    return userAccounts.filter((u) => {
      const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
      const matchStatus = statusFilter === 'Semua' || u.status === statusFilter;
      const q = userSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    });
  }, [userAccounts, roleFilter, statusFilter, userSearch]);

  const currentMacroStats = useMemo(() => {
    const base = MACRO_IMPACT_BY_PERIOD[macroPeriod];
    const verifiedUmkmExtra = umkmVerifications.filter(
      (u) => u.status === 'Verified'
    ).length;
    return {
      ...base,
      activeUmkmPartners: base.activeUmkmPartners + Math.max(0, verifiedUmkmExtra - 2),
    };
  }, [macroPeriod, umkmVerifications]);

  const handleExportCsvReport = () => {
    const rows = [
      ['Indikator Dampak SisaPiring', 'Nilai', 'Periode'],
      [
        'Total Porsi Makanan Terselamatkan',
        String(currentMacroStats.totalPortionsRescued),
        currentMacroStats.periodLabel,
      ],
      [
        'Total Transaksi Selesai',
        String(currentMacroStats.totalTransactionsCompleted),
        currentMacroStats.periodLabel,
      ],
      [
        'Pengurangan Sampah Pangan (kg)',
        String(currentMacroStats.foodWastePreventedKg),
        currentMacroStats.periodLabel,
      ],
      [
        'Pengurangan Emisi Karbon CO2e (kg)',
        String(currentMacroStats.co2EmissionsSavedKg),
        currentMacroStats.periodLabel,
      ],
      [
        'Mitra UMKM Aktif Berpartisipasi',
        String(currentMacroStats.activeUmkmPartners),
        currentMacroStats.periodLabel,
      ],
      [
        'Pendapatan UMKM Dipulihkan (IDR)',
        String(currentMacroStats.umkmRevenueRecovered),
        currentMacroStats.periodLabel,
      ],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Dampak_SisaPiring_${macroPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan CSV Dampak Makro SisaPiring berhasil diunduh.');
  };

  const NAV_ITEMS: {
    id: AdminModuleTab;
    label: string;
    shortDesc: string;
    icon: React.FC<{ className?: string }>;
    counter?: number;
  }[] = [
    {
      id: 'macro-impact',
      label: 'Dasbor Dampak Makro',
      shortDesc: 'Food Rescue Statistics',
      icon: BarChart3,
    },
    {
      id: 'seller-verification',
      label: 'Validasi UMKM',
      shortDesc: 'Seller Verification',
      icon: Store,
      counter: pendingUmkmCount,
    },
    {
      id: 'product-monitoring',
      label: 'Pemantauan Produk',
      shortDesc: 'Product & Food Safety',
      icon: PackageCheck,
      counter: flaggedProductCount,
    },
    {
      id: 'report-management',
      label: 'Penyelesaian Sengketa',
      shortDesc: 'Report Management',
      icon: ShieldAlert,
      counter: openDisputesCount,
    },
    {
      id: 'transaction-monitoring',
      label: 'Transaksi & Anti-Manipulasi',
      shortDesc: 'Discount History & Refund',
      icon: Receipt,
      counter: anomalyTrxCount,
    },
    {
      id: 'access-control',
      label: 'Manajemen Hak Akses',
      shortDesc: 'Account Access Control',
      icon: Users,
      counter: suspendedUsersCount,
    },
  ];

  const activeNavMeta =
    NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-stone-900 flex flex-col lg:flex-row">
      {/* LEFT SIDEBAR NAVIGATION (268px Desktop) */}
      <aside className="w-full lg:w-[272px] bg-[#122C22] text-stone-100 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Brand Lockup */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
              <span className="text-base font-bold tracking-tight font-display text-white">
                SisaPiring Admin
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              Pusat Tata Kelola & Keamanan Pangan
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="lg:hidden px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer whitespace-nowrap"
          >
            Lihat Etalase
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Menu Modul Admin"
          className="p-3 flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer shrink-0 lg:w-full ${
                  isActive
                    ? 'bg-white text-[#122C22] font-semibold shadow-2xs'
                    : 'text-stone-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#122C22]' : 'text-amber-300/90'
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold truncate">
                      {item.label}
                    </span>
                    <span
                      className={`hidden lg:block text-[11px] truncate ${
                        isActive ? 'text-stone-600' : 'text-stone-400'
                      }`}
                    >
                      {item.shortDesc}
                    </span>
                  </div>
                </div>
                {typeof item.counter === 'number' && item.counter > 0 && (
                  <span
                    className={`text-[11px] font-mono-tabular font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-[#122C22] text-amber-300'
                        : 'bg-white/15 text-amber-300'
                    }`}
                  >
                    {item.counter}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Admin Identity & Quick Switch to Public App */}
        <div className="hidden lg:flex flex-col mt-auto p-4 border-t border-white/10 space-y-3">
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-white">Nabil Rachman</p>
            <p className="text-[11px] text-stone-300">
              Pengelola Platform · Wilayah Bandung
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="w-full h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium inline-flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Buka Etalase Pembeli</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Top Bar Contract */}
        <header className="bg-white border-b border-stone-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 min-w-0">
            <span className="font-medium text-stone-600 whitespace-nowrap">
              Panel Pengelola
            </span>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-stone-900 truncate">
              {activeNavMeta.label}
            </span>
            <span
              aria-hidden="true"
              className="hidden sm:inline text-stone-300"
            >
              ·
            </span>
            <span className="hidden sm:inline text-xs text-stone-500 truncate">
              {activeNavMeta.shortDesc}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === 'macro-impact' && (
              <button
                type="button"
                onClick={handleExportCsvReport}
                className="h-9 px-3.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#16382C]" />
                <span>Unduh CSV Dampak</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSwitchToPublicEtalase}
              className="h-9 px-3.5 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Lihat Etalase Publik</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </header>

        {/* Feedback Banner */}
        {adminNotice && (
          <div className="mx-4 sm:mx-8 mt-4 px-4 py-3 rounded-xl bg-stone-900 text-white text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{adminNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAdminNotice(null)}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODULE CONTENT CONTAINER */}
        <div className="p-4 sm:p-8 space-y-6 max-w-[1360px] w-full mx-auto">
          {/* =====================================================================
              MODULE 6 (DEFAULT HOME): DASBOR DAMPAK MAKRO (FOOD RESCUE STATISTICS)
             ===================================================================== */}
          {activeTab === 'macro-impact' && (
            <div className="space-y-6">
              {/* Top Heading + Timeframe Selector */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                    Dasbor Dampak Makro & Food Rescue Tracker
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Pemantauan indikator keberhasilan penyelamatan pangan, reduksi emisi karbon, dan partisipasi mitra UMKM Bandung.
                  </p>
                </div>

                {/* Interactive Period Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl self-start">
                  {(
                    [
                      { id: '7d', label: '7 Hari' },
                      { id: '30d', label: '30 Hari' },
                      { id: 'quarter', label: 'Kuartal Ini' },
                      { id: 'all', label: 'Semua Waktu' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setMacroPeriod(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        macroPeriod === p.id
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Primary Macro Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-xs font-medium text-stone-500">
                    Total Makanan Terselamatkan
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono-tabular">
                    {currentMacroStats.totalPortionsRescued.toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-normal text-stone-500">Porsi</span>
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    Setara {currentMacroStats.foodWastePreventedKg.toLocaleString('id-ID')} kg sampah pangan dicegah
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-xs font-medium text-stone-500">
                    Total Transaksi Selesai
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono-tabular">
                    {currentMacroStats.totalTransactionsCompleted.toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-normal text-stone-500">Pesanan</span>
                  </p>
                  <p className="text-xs text-stone-600">
                    Pendapatan UMKM pulih:{' '}
                    <strong className="font-mono-tabular text-stone-900">
                      {formatRupiah(currentMacroStats.umkmRevenueRecovered)}
                    </strong>
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-xs font-medium text-stone-500">
                    Estimasi Pengurangan Emisi Gas Rumah Kaca
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-[#16382C] font-mono-tabular">
                    {currentMacroStats.co2EmissionsSavedKg.toLocaleString('id-ID')}{' '}
                    <span className="text-sm font-normal text-stone-500">kg CO₂e</span>
                  </p>
                  <p className="text-xs text-stone-600">
                    Hemat jejak air produksi:{' '}
                    <strong className="font-mono-tabular">
                      {(currentMacroStats.waterSavedLiters / 1000).toFixed(1)}k Liter
                    </strong>
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-xs font-medium text-stone-500">
                    Partisipasi Mitra UMKM Bandung
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono-tabular">
                    {currentMacroStats.activeUmkmPartners}{' '}
                    <span className="text-sm font-normal text-stone-500">
                      / {currentMacroStats.totalUmkmApplications} UMKM
                    </span>
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    Penghematan warga:{' '}
                    <strong className="font-mono-tabular">
                      {formatRupiah(currentMacroStats.citizenSavingsTotal)}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Actionable Governance Queue Strip (Links to the other 5 Admin Modules) */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">
                      Antrean Tugas Pengelola Platform Hari Ini
                    </h2>
                    <p className="text-xs text-stone-500">
                      Ringkasan item operasional yang memerlukan tinjauan atau keputusan Admin.
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 font-mono-tabular">
                    Periode Aktif: {currentMacroStats.periodLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('seller-verification')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-[#16382C] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-stone-500 block">Validasi UMKM</span>
                    <span className="text-lg font-bold text-stone-900 font-mono-tabular mt-0.5 block">
                      {pendingUmkmCount} Menunggu
                    </span>
                    <span className="text-[11px] text-[#16382C] font-semibold mt-1 inline-flex items-center gap-1">
                      Periksa Dokumen <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('product-monitoring')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-[#16382C] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-stone-500 block">Keamanan Produk</span>
                    <span className="text-lg font-bold text-stone-900 font-mono-tabular mt-0.5 block">
                      {flaggedProductCount} Perlu Audit
                    </span>
                    <span className="text-[11px] text-[#16382C] font-semibold mt-1 inline-flex items-center gap-1">
                      Pantau Etalase <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('report-management')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-[#16382C] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-stone-500 block">Sengketa Pembeli</span>
                    <span className="text-lg font-bold text-red-700 font-mono-tabular mt-0.5 block">
                      {openDisputesCount} Komplain Aktif
                    </span>
                    <span className="text-[11px] text-[#16382C] font-semibold mt-1 inline-flex items-center gap-1">
                      Tindak Lanjuti <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('transaction-monitoring');
                      setTrxSubTab('discount-history');
                    }}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-[#16382C] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-stone-500 block">Anti-Manipulasi Harga</span>
                    <span className="text-lg font-bold text-amber-800 font-mono-tabular mt-0.5 block">
                      {anomalyTrxCount} Indikasi Markup
                    </span>
                    <span className="text-[11px] text-[#16382C] font-semibold mt-1 inline-flex items-center gap-1">
                      Cek Discount History <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('access-control')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-[#16382C] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-stone-500 block">Manajemen Akun</span>
                    <span className="text-lg font-bold text-stone-900 font-mono-tabular mt-0.5 block">
                      {userAccounts.length} Akun Terdaftar
                    </span>
                    <span className="text-[11px] text-[#16382C] font-semibold mt-1 inline-flex items-center gap-1">
                      Kelola Hak Akses <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Two-Column Split: Timeline Trend + Culinary Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left 7 Cols: Timeline Volume & Food Waste Prevented */}
                <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3.5">
                    <div>
                      <h2 className="text-sm font-bold text-stone-900">
                        Tren Penyelamatan Porsi & Pengurangan Food Waste
                      </h2>
                      <p className="text-xs text-stone-500">
                        Perbandingan porsi terselamatkan, transaksi selesai, dan berat limbah pangan yang dicegah.
                      </p>
                    </div>
                    <span className="text-xs font-mono-tabular text-stone-500">
                      1 Porsi ≈ 0,45 kg Pangan
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {currentMacroStats.timelineData.map((row) => {
                      const maxPortions = Math.max(
                        ...currentMacroStats.timelineData.map((t) => t.portions),
                        1
                      );
                      const widthPct = Math.round((row.portions / maxPortions) * 100);
                      return (
                        <div key={row.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-800">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-3 font-mono-tabular text-stone-600">
                              <span>
                                <strong className="text-stone-900">{row.portions}</strong> porsi
                              </span>
                              <span>·</span>
                              <span>{row.transactions} transaksi</span>
                              <span>·</span>
                              <span className="text-[#16382C] font-semibold">
                                -{row.wasteKg} kg limbah
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#16382C] rounded-full transition-all duration-300"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                    <span>
                      Formula Emisi: 1 kg makanan berlebih yang diselamatkan mencegah ≈ 2,5 kg emisi CO₂e di TPA.
                    </span>
                    <span className="font-mono-tabular font-semibold text-stone-800">
                      Tingkat Keberhasilan Serah Terima: 98,4%
                    </span>
                  </div>
                </div>

                {/* Right 5 Cols: Category Contribution */}
                <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="border-b border-stone-100 pb-3.5">
                    <h2 className="text-sm font-bold text-stone-900">
                      Kontribusi Kategori Kuliner UMKM
                    </h2>
                    <p className="text-xs text-stone-500">
                      Distribusi porsi terselamatkan dan rata-rata diskon per jenis usaha.
                    </p>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {currentMacroStats.categoryImpact.map((cat) => (
                      <div
                        key={cat.category}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {cat.category}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono-tabular">
                            {cat.transactions.toLocaleString('id-ID')} transaksi · Diskon rata-rata {cat.avgDiscountPercent}%
                          </p>
                        </div>
                        <div className="text-right shrink-0 font-mono-tabular">
                          <span className="block text-xs font-bold text-stone-900">
                            {cat.portionsRescued.toLocaleString('id-ID')} porsi
                          </span>
                          <span className="block text-[11px] text-emerald-800">
                            -{cat.co2SavedKg.toLocaleString('id-ID')} kg CO₂e
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* District Participation Table across Bandung */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">
                      Partisipasi UMKM & Dampak Penyelamatan per Kecamatan di Kota Bandung
                    </h2>
                    <p className="text-xs text-stone-500">
                      Indikator kepadatan mitra aktif dan rasio keaktifan unggah stok sore harian.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                        <th className="py-3 px-5">Wilayah Kecamatan</th>
                        <th className="py-3 px-4 text-right">Mitra UMKM Aktif</th>
                        <th className="py-3 px-4 text-right">Porsi Terselamatkan</th>
                        <th className="py-3 px-4 text-right">Reduksi Food Waste</th>
                        <th className="py-3 px-5 text-right">Tingkat Partisipasi Sore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {currentMacroStats.districtStats.map((d) => (
                        <tr key={d.district} className="hover:bg-stone-50/80">
                          <td className="py-3 px-5 font-semibold text-stone-900">
                            {d.district}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular text-stone-700">
                            {d.activeUmkm} Toko
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular font-bold text-stone-900">
                            {d.portionsRescued.toLocaleString('id-ID')} Porsi
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular text-emerald-800 font-semibold">
                            {d.wasteReducedKg.toLocaleString('id-ID')} kg
                          </td>
                          <td className="py-3 px-5 text-right font-mono-tabular">
                            <span className="font-semibold text-stone-900">
                              {d.participationRate}%
                            </span>{' '}
                            <span className="text-stone-400">konsisten</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 1: VALIDASI UMKM (SELLER VERIFICATION)
             ===================================================================== */}
          {activeTab === 'seller-verification' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                    Validasi UMKM (Seller Verification)
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Periksa keabsahan dokumen usaha (NIB, KTP, PIRT/Halal), setujui (Verified), tolak, atau tangguhkan (Suspended) akun mitra UMKM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUmkmModal(true)}
                  className="h-10 px-4 rounded-xl bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simulasi Pengajuan UMKM Baru</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
                  {(
                    [
                      'Semua',
                      'Menunggu Verifikasi',
                      'Verified',
                      'Suspended',
                      'Ditolak',
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUmkmFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        umkmFilter === st
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={umkmSearch}
                    onChange={(e) => setUmkmSearch(e.target.value)}
                    placeholder="Cari nama toko, pemilik, NIB..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#16382C]"
                  />
                </div>
              </div>

              {/* UMKM Verification Table */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                        <th className="py-3 px-4">Identitas Usaha UMKM</th>
                        <th className="py-3 px-4">Penanggung Jawab & Kontak</th>
                        <th className="py-3 px-4">Dokumen Legalitas (NIB / PIRT)</th>
                        <th className="py-3 px-4">Status Validasi</th>
                        <th className="py-3 px-4 text-right">Tindakan Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {filteredUmkmList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-stone-500">
                            Tidak ada pengajuan UMKM yang sesuai dengan filter pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredUmkmList.map((umkm) => (
                          <tr key={umkm.id} className="hover:bg-stone-50/80 align-top">
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                  <ResilientImage
                                    src={umkm.storePhotoUrl}
                                    alt={umkm.storeName}
                                    fallbackTitle={umkm.storeName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-stone-900">
                                    {umkm.storeName}
                                  </p>
                                  <p className="text-[11px] text-stone-500 mt-0.5">
                                    {umkm.category} · {umkm.district}
                                  </p>
                                  <p className="text-[11px] text-stone-400 font-mono-tabular mt-0.5">
                                    Diajukan: {umkm.submittedAt}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-stone-900">
                                {umkm.ownerName}
                              </p>
                              <p className="text-[11px] text-stone-500">{umkm.email}</p>
                              <p className="text-[11px] font-mono-tabular text-stone-600 mt-0.5">
                                {umkm.phone}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 font-mono-tabular">
                              <p className="text-stone-800">
                                <span className="text-stone-400 font-sans">NIB:</span>{' '}
                                {umkm.nibNumber}
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                <span className="text-stone-400 font-sans">Izin:</span>{' '}
                                {umkm.halalOrPirtNumber}
                              </p>
                              <p className="text-[11px] text-[#16382C] font-sans font-medium mt-0.5 truncate max-w-[210px]">
                                Berkas: {umkm.docFileName}
                              </p>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1.5 font-semibold">
                                {umkm.status === 'Verified' && (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span className="text-emerald-800">Verified</span>
                                  </>
                                )}
                                {umkm.status === 'Menunggu Verifikasi' && (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span className="text-amber-800">
                                      Menunggu Verifikasi
                                    </span>
                                  </>
                                )}
                                {umkm.status === 'Suspended' && (
                                  <>
                                    <Ban className="w-4 h-4 text-red-600 shrink-0" />
                                    <span className="text-red-700">Suspended</span>
                                  </>
                                )}
                                {umkm.status === 'Ditolak' && (
                                  <>
                                    <XCircle className="w-4 h-4 text-stone-500 shrink-0" />
                                    <span className="text-stone-600">Ditolak</span>
                                  </>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 mt-1 max-w-[220px] line-clamp-2">
                                {umkm.adminNotes}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUmkmModal(umkm);
                                    setUmkmNoteInput(umkm.adminNotes);
                                  }}
                                  className="h-8 px-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Periksa Dokumen</span>
                                </button>

                                {umkm.status !== 'Verified' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateUmkmStatus(
                                        umkm.id,
                                        'Verified',
                                        'Dokumen NIB, KTP & standar kebersihan dapur telah diverifikasi dan disetujui Admin.'
                                      );
                                      showToast(
                                        `Akun UMKM "${umkm.storeName}" berhasil disetujui (Verified).`
                                      );
                                    }}
                                    className="h-8 px-2.5 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    Setujui (Verify)
                                  </button>
                                )}

                                {umkm.status !== 'Suspended' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateUmkmStatus(
                                        umkm.id,
                                        'Suspended',
                                        'Akun UMKM ditangguhkan sementara oleh Admin untuk audit ulang dokumen/operasional.'
                                      );
                                      showToast(
                                        `Akun UMKM "${umkm.storeName}" telah ditangguhkan (Suspended).`
                                      );
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 2: PEMANTAUAN PRODUK & KEAMANAN (PRODUCT MONITORING)
             ===================================================================== */}
          {activeTab === 'product-monitoring' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                    Pemantauan Produk & Keamanan Pangan
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Awasi seluruh menu surplus yang diunggah UMKM dan nonaktifkan (Take Down) produk yang dilaporkan bermasalah atau melanggar keamanan pangan. Produk yang di-take down otomatis disembunyikan dari Etalase Pembeli.
                  </p>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
                  {(
                    [
                      'Semua',
                      'Aktif & Aman',
                      'Dalam Tinjauan',
                      'Take Down',
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setProductFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        productFilter === st
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama makanan atau toko UMKM..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#16382C]"
                  />
                </div>
              </div>

              {/* Product Monitoring Grid / Table */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                        <th className="py-3 px-4">Produk Hidangan & UMKM</th>
                        <th className="py-3 px-4">Jam Masak & Jendela Ambil</th>
                        <th className="py-3 px-4 text-right">Harga & Kuota</th>
                        <th className="py-3 px-4">Indikator Keamanan Pangan</th>
                        <th className="py-3 px-4">Status Etalase</th>
                        <th className="py-3 px-4 text-right">Kontrol Keamanan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {filteredProducts.map((item) => {
                        const meta = productMonitoring[item.id] || {
                          itemId: item.id,
                          monitoringStatus: 'Aktif & Aman',
                          reportCount: 0,
                          safetyFlag: 'Aman',
                          prepWindowVerified: true,
                          lastCheckedAt: 'Hari ini',
                        };

                        return (
                          <tr key={item.id} className="hover:bg-stone-50/80 align-top">
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                  <ResilientImage
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fallbackTitle={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 max-w-[250px]">
                                  <p className="font-bold text-stone-900 line-clamp-1">
                                    {item.title}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => onOpenPublicStore(item.merchantName)}
                                    className="text-[11px] font-semibold text-[#16382C] hover:underline cursor-pointer"
                                  >
                                    {item.merchantName}
                                  </button>
                                  <p className="text-[11px] text-stone-500">
                                    {item.category} · {item.district}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono-tabular">
                              <p className="text-stone-800 font-semibold">
                                {item.freshBakedTime}
                              </p>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Ambil: {item.pickupWindow}
                              </p>
                              <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                                {item.dietaryNotes}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono-tabular">
                              <p className="font-bold text-[#16382C]">
                                {formatRupiah(item.rescuePrice)}
                              </p>
                              <p className="text-[11px] text-stone-400 line-through">
                                {formatRupiah(item.originalPrice)}
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Sisa {item.remainingStock}/{item.initialQuota}
                              </p>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="font-medium text-stone-800 max-w-[220px]">
                                {meta.safetyFlag}
                              </p>
                              <p className="text-[11px] text-stone-500 font-mono-tabular mt-0.5">
                                Laporan masuk: {meta.reportCount} · Cek: {meta.lastCheckedAt}
                              </p>
                              {meta.takedownReason && (
                                <p className="text-[11px] text-red-700 font-medium mt-1 max-w-[220px]">
                                  Alasan Take Down: {meta.takedownReason}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1.5 font-semibold">
                                {meta.monitoringStatus === 'Aktif & Aman' && (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                    <span className="text-emerald-800">Aktif & Aman</span>
                                  </>
                                )}
                                {meta.monitoringStatus === 'Dalam Tinjauan' && (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span className="text-amber-800">Dalam Tinjauan</span>
                                  </>
                                )}
                                {meta.monitoringStatus === 'Take Down' && (
                                  <>
                                    <Ban className="w-4 h-4 text-red-600 shrink-0" />
                                    <span className="text-red-700">
                                      Take Down (Nonaktif)
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {meta.monitoringStatus !== 'Take Down' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTakedownModalItem(item);
                                      setTakedownCustomNote('');
                                    }}
                                    className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Take Down</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProductMonitoring(
                                        item.id,
                                        'Aktif & Aman'
                                      );
                                      showToast(
                                        `Produk "${item.title}" telah diaktifkan kembali ke Etalase Publik.`
                                      );
                                    }}
                                    className="h-8 px-3 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Pulihkan ke Etalase</span>
                                  </button>
                                )}

                                {meta.monitoringStatus === 'Dalam Tinjauan' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProductMonitoring(
                                        item.id,
                                        'Aktif & Aman'
                                      );
                                      showToast(
                                        `Audit keamanan "${item.title}" selesai dan dinyatakan Aman.`
                                      );
                                    }}
                                    className="h-8 px-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    Verifikasi Aman
                                  </button>
                                )}
                              </div>
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

          {/* =====================================================================
              MODULE 3: PENYELESAIAN SENGKETA (REPORT MANAGEMENT)
             ===================================================================== */}
          {activeTab === 'report-management' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                  Penyelesaian Sengketa & Komplain Pembeli (Report Management)
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Tinjau dan tindak lanjuti laporan pembeli terkait dugaan penipuan, makanan basi/tidak layak konsumsi, atau pesanan yang tidak diserahkan oleh toko.
                </p>
              </div>

              {/* Filter & Search */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
                  {(['Semua', 'Aktif', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDisputeFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        disputeFilter === st
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st === 'Aktif' ? 'Perlu Tindakan (Aktif)' : st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={disputeSearch}
                    onChange={(e) => setDisputeSearch(e.target.value)}
                    placeholder="Cari tiket #KL, pesanan, toko, pelapor..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#16382C]"
                  />
                </div>
              </div>

              {/* Disputes List */}
              <div className="space-y-3">
                {filteredDisputes.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-xs text-stone-500">
                    Tidak ada tiket komplain/sengketa pada kategori filter ini.
                  </div>
                ) : (
                  filteredDisputes.map((disp) => {
                    const isResolved =
                      disp.status !== 'Sedang Ditinjau' &&
                      disp.status !== 'Investigasi Mitra';
                    return (
                      <div
                        key={disp.id}
                        className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3.5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-100">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold font-mono-tabular text-stone-900">
                                Tiket #{disp.ticketCode}
                              </span>
                              <span>·</span>
                              <span className="font-mono-tabular text-stone-600">
                                Pesanan #{disp.orderCode}
                              </span>
                              <span>·</span>
                              <span
                                className={`font-semibold ${
                                  disp.severity.includes('Kritis')
                                    ? 'text-red-700'
                                    : disp.severity.includes('Tinggi')
                                    ? 'text-amber-800'
                                    : 'text-stone-700'
                                }`}
                              >
                                Prioritas: {disp.severity}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-stone-900 pt-0.5">
                              {disp.category} —{' '}
                              <span className="text-[#16382C]">{disp.merchantName}</span>
                            </p>
                          </div>

                          <div className="text-right font-mono-tabular">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold ${
                                isResolved ? 'text-emerald-800' : 'text-amber-800'
                              }`}
                            >
                              {isResolved ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                              <span>{disp.status}</span>
                            </span>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              {disp.createdAt}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                          <div className="md:col-span-8 space-y-1.5">
                            <p className="text-stone-500">
                              Produk Terkait:{' '}
                              <strong className="text-stone-800">{disp.itemName}</strong>{' '}
                              · Nilai Transaksi:{' '}
                              <strong className="font-mono-tabular text-stone-900">
                                {formatRupiah(disp.amountPaid)}
                              </strong>
                            </p>
                            <p className="text-stone-800 leading-relaxed bg-[#FAF9F6] p-3 rounded-lg border border-stone-200/80">
                              "{disp.description}"
                            </p>
                            {disp.adminResolutionNote && (
                              <p className="text-emerald-900 font-medium pt-1">
                                Putusan Admin: {disp.adminResolutionNote}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-4 flex flex-col justify-between bg-[#FAF9F6] p-3.5 rounded-lg border border-stone-200/70 space-y-3">
                            <div className="space-y-1">
                              <p className="text-[11px] text-stone-500">
                                Pelapor (Pembeli):
                              </p>
                              <p className="font-semibold text-stone-900">
                                {disp.reporterName} ({disp.reporterPhone})
                              </p>
                              {disp.evidenceFileName && (
                                <p className="text-[11px] text-[#16382C] font-medium flex items-center gap-1 pt-1">
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">
                                    Lampiran: {disp.evidenceFileName}
                                  </span>
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/70">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDispute(disp);
                                  setDisputeNoteInput(
                                    disp.adminResolutionNote ||
                                      'Bukti foto valid. Dana dikembalikan 100% ke pembeli dan peringatan keras diberikan ke UMKM.'
                                  );
                                  setDisputeAutoTakedown(
                                    disp.category === 'Makanan Basi / Tidak Layak Konsumsi'
                                  );
                                }}
                                className="w-full h-8 px-3 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                              >
                                Putuskan Sengketa / Tindak Lanjut
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 4: PEMANTAUAN TRANSAKSI & ANTI-MANIPULASI
             ===================================================================== */}
          {activeTab === 'transaction-monitoring' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                    Pemantauan Transaksi & Anti-Manipulasi Diskon
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Awasi log transaksi keseluruhan, audit Discount History untuk mencegah manipulasi kenaikan harga normal semu, dan kelola pembatalan/refund pembayaran.
                  </p>
                </div>

                {/* Sub-Tab Switcher: Log Transaksi vs Discount History */}
                <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl self-start">
                  <button
                    type="button"
                    onClick={() => setTrxSubTab('transactions')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      trxSubTab === 'transactions'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Log Transaksi & Refund ({transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrxSubTab('discount-history')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      trxSubTab === 'discount-history'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Audit Discount History ({discountHistory.length})
                  </button>
                </div>
              </div>

              {trxSubTab === 'transactions' ? (
                <>
                  {/* Filter & Search Bar for Transactions */}
                  <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
                      {(
                        [
                          { id: 'Semua', label: 'Semua Transaksi' },
                          { id: 'Anomali', label: 'Indikasi Manipulasi Harga' },
                          { id: 'Escrow', label: 'Dana Ditahan (Escrow)' },
                          { id: 'Refunded', label: 'Refund / Batal' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setTrxFilter(f.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            trxFilter === f.id
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={trxSearch}
                        onChange={(e) => setTrxSearch(e.target.value)}
                        placeholder="Cari kode SP-, pembeli, referensi QRIS..."
                        className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#16382C]"
                      />
                    </div>
                  </div>

                  {/* Transaction Log Table */}
                  <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                            <th className="py-3 px-4">Kode & Waktu</th>
                            <th className="py-3 px-4">Pembeli & Mitra UMKM</th>
                            <th className="py-3 px-4 text-right">Audit Harga Normal vs Diskon</th>
                            <th className="py-3 px-4 text-right">Total Bayar</th>
                            <th className="py-3 px-4">Gateway & Status Dana</th>
                            <th className="py-3 px-4 text-right">Kontrol Gateway / Refund</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-xs">
                          {filteredTransactions.map((trx) => (
                            <tr key={trx.id} className="hover:bg-stone-50/80 align-top">
                              <td className="py-3.5 px-4 font-mono-tabular">
                                <p className="font-bold text-stone-900">
                                  #{trx.orderCode}
                                </p>
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  {trx.timestamp}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                  {trx.paymentGatewayRef}
                                </p>
                              </td>

                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-stone-900">
                                  {trx.buyerName}
                                </p>
                                <p className="text-[11px] text-[#16382C] font-semibold mt-0.5">
                                  Toko: {trx.merchantName}
                                </p>
                                <p className="text-[11px] text-stone-500 line-clamp-1 max-w-[230px]">
                                  {trx.quantity}x {trx.itemTitle}
                                </p>
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono-tabular">
                                <p className="text-stone-800">
                                  Klaim Normal:{' '}
                                  <strong>{formatRupiah(trx.reportedNormalPrice)}</strong>{' '}
                                  (-{trx.reportedDiscountPercent}%)
                                </p>
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  Baseline Asli: {formatRupiah(trx.verifiedBaselinePrice)} (Diskon Riil {trx.realDiscountPercent}%)
                                </p>
                                {trx.manipulationFlag !== 'Aman' && (
                                  <p className="text-[11px] text-red-700 font-sans font-semibold mt-1">
                                    ⚠ {trx.manipulationFlag}
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono-tabular">
                                <span className="font-bold text-sm text-stone-900">
                                  {formatRupiah(trx.totalPaid)}
                                </span>
                                <span className="block text-[11px] text-stone-500 font-sans">
                                  {trx.paymentMethod}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`font-semibold ${
                                    trx.gatewayStatus === 'Selesai (Settled)'
                                      ? 'text-emerald-800'
                                      : trx.gatewayStatus === 'Dana Ditahan (Escrow)'
                                      ? 'text-amber-800'
                                      : 'text-red-700'
                                  }`}
                                >
                                  {trx.gatewayStatus}
                                </span>
                                {trx.adminActionNote && (
                                  <p className="text-[11px] text-stone-500 mt-1 max-w-[210px]">
                                    {trx.adminActionNote}
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {trx.gatewayStatus !== 'Refunded' &&
                                    trx.gatewayStatus !== 'Dibatalkan' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onUpdateTransactionGateway(
                                            trx.id,
                                            'Refunded',
                                            'Refund diproses oleh Admin via Payment Gateway ke akun pembeli.'
                                          );
                                          showToast(
                                            `Refund otomatis untuk transaksi #${trx.orderCode} (${formatRupiah(
                                              trx.totalPaid
                                            )}) berhasil diterbitkan.`
                                          );
                                        }}
                                        className="h-8 px-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                      >
                                        Proses Refund
                                      </button>
                                    )}

                                  {trx.gatewayStatus === 'Dana Ditahan (Escrow)' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateTransactionGateway(
                                          trx.id,
                                          'Selesai (Settled)',
                                          'Dana Escrow telah dicairkan (Settled) ke rekening mitra UMKM.'
                                        );
                                        showToast(
                                          `Dana Escrow #${trx.orderCode} berhasil dicairkan ke ${trx.merchantName}.`
                                        );
                                      }}
                                      className="h-8 px-2.5 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                    >
                                      Cairkan Escrow
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* SUB-TAB 2: DISCOUNT HISTORY & DETEKSI MANIPULASI HARGA */
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-stone-900">
                        Riwayat Diskon & Deteksi Anti-Manipulasi Harga Normal (Discount History)
                      </h2>
                      <p className="text-xs text-stone-500">
                        Sistem membandingkan harga normal yang diajukan mitra saat jam penyelamatan dengan rata-rata harga menu historis 30 hari terakhir.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                          <th className="py-3 px-4">Produk & Mitra UMKM</th>
                          <th className="py-3 px-4 text-right">Harga Normal Historis</th>
                          <th className="py-3 px-4 text-right">Harga Normal Diajukan</th>
                          <th className="py-3 px-4 text-right">Harga Penyelamatan</th>
                          <th className="py-3 px-4 text-right">Deviasi Markup</th>
                          <th className="py-3 px-4">Status Audit Harga</th>
                          <th className="py-3 px-4 text-right">Tindakan Koreksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-xs">
                        {discountHistory.map((dh) => (
                          <tr key={dh.id} className="hover:bg-stone-50/80 align-top">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-stone-900">{dh.itemTitle}</p>
                              <p className="text-[11px] text-[#16382C] font-semibold">
                                {dh.merchantName}
                              </p>
                              <p className="text-[11px] text-stone-400 font-mono-tabular">
                                Tercatat: {dh.recordedDate}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-stone-800">
                              {formatRupiah(dh.historicalNormalPrice)}
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono-tabular">
                              <span
                                className={
                                  dh.markupDeviationPercent > 0
                                    ? 'font-bold text-red-700'
                                    : 'text-stone-800'
                                }
                              >
                                {formatRupiah(dh.submittedNormalPrice)}
                              </span>
                              <span className="block text-[11px] text-stone-500">
                                Klaim Diskon: {dh.claimedDiscountPercent}%
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-[#16382C]">
                              {formatRupiah(dh.rescuePrice)}
                              <span className="block text-[11px] font-normal text-stone-500">
                                Diskon Riil: {dh.actualDiscountFromBaseline}%
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono-tabular">
                              {dh.markupDeviationPercent > 0 ? (
                                <span className="font-bold text-red-700">
                                  +{dh.markupDeviationPercent}% Markup
                                </span>
                              ) : (
                                <span className="text-emerald-800 font-semibold">
                                  0% (Sesuai)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`font-semibold ${
                                  dh.status === 'Terverifikasi Wajar'
                                    ? 'text-emerald-800'
                                    : dh.status === 'Peringatan Manipulasi Harga'
                                    ? 'text-red-700'
                                    : 'text-stone-700'
                                }`}
                              >
                                {dh.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {dh.status === 'Peringatan Manipulasi Harga' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onCorrectProductPrice(
                                      dh.itemId,
                                      dh.historicalNormalPrice,
                                      dh.id
                                    );
                                    showToast(
                                      `Harga normal "${dh.itemTitle}" telah dikoreksi kembali ke baseline ${formatRupiah(
                                        dh.historicalNormalPrice
                                      )}.`
                                    );
                                  }}
                                  className="h-8 px-3 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                >
                                  Koreksi ke Harga Asli
                                </button>
                              ) : (
                                <span className="text-[11px] text-stone-400">
                                  Harga Terverifikasi
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              MODULE 5: MANAJEMEN HAK AKSES (ACCOUNT ACCESS CONTROL)
             ===================================================================== */}
          {activeTab === 'access-control' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                    Manajemen Hak Akses (Account Access Control)
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Kelola role pengguna (Buyer, UMKM, Admin), tinjau riwayat pelanggaran, dan berikan sanksi peringatan atau suspend akun yang melanggar aturan platform.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="h-10 px-4 rounded-xl bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Pengguna / Role</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Role Filter */}
                  <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
                    {(['Semua', 'Buyer', 'UMKM', 'Admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          roleFilter === r
                            ? 'bg-white text-stone-900 shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {r === 'Semua' ? 'Semua Role' : r}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
                    {(
                      ['Semua', 'Aktif', 'Peringatan (Warning)', 'Suspended'] as const
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          statusFilter === s
                            ? 'bg-white text-stone-900 shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {s === 'Semua' ? 'Semua Status' : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full lg:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari nama, email, telepon, kecamatan..."
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[#16382C]"
                  />
                </div>
              </div>

              {/* Accounts Table */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-semibold text-stone-600">
                        <th className="py-3 px-4">Nama & Kontak Akun</th>
                        <th className="py-3 px-4">Role Hak Akses</th>
                        <th className="py-3 px-4">Wilayah & Aktivitas</th>
                        <th className="py-3 px-4">Status & Catatan Sanksi</th>
                        <th className="py-3 px-4 text-right">Manajemen Role & Sanksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-xs">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-stone-50/80 align-top">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-stone-900">{u.name}</p>
                            <p className="text-[11px] text-stone-500">{u.email}</p>
                            <p className="text-[11px] font-mono-tabular text-stone-600 mt-0.5">
                              {u.phone}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-stone-900">{u.role}</span>
                            <p className="text-[11px] text-stone-500">
                               Terdaftar: {u.joinedAt}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-stone-800">{u.district}</p>
                            <p className="text-[11px] text-stone-500 font-mono-tabular mt-0.5">
                              Aktif: {u.lastActive}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 font-semibold">
                              {u.status === 'Aktif' && (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                  <span className="text-emerald-800">Aktif</span>
                                </>
                              )}
                              {u.status === 'Peringatan (Warning)' && (
                                <>
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="text-amber-800">
                                    Peringatan ({u.violationCount}x Pelanggaran)
                                  </span>
                                </>
                              )}
                              {u.status === 'Suspended' && (
                                <>
                                  <Lock className="w-4 h-4 text-red-600 shrink-0" />
                                  <span className="text-red-700">
                                    Suspended ({u.violationCount}x Pelanggaran)
                                  </span>
                                </>
                              )}
                            </div>
                            {u.sanctionNote && (
                              <p className="text-[11px] text-stone-500 mt-1 max-w-[240px]">
                                {u.sanctionNote}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserModal(u);
                                  setEditUserRole(u.role);
                                  setEditUserStatus(u.status);
                                  setEditUserSanction(u.sanctionNote || '');
                                }}
                                className="h-8 px-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>Ubah Role / Sanksi</span>
                              </button>

                              {u.status !== 'Suspended' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateUserAccess(
                                      u.id,
                                      u.role,
                                      'Suspended',
                                      'Akun dibekukan (Suspended) oleh Admin karena pelanggaran tata tertib platform.'
                                    );
                                    showToast(`Akun "${u.name}" telah di-Suspend.`);
                                  }}
                                  className="h-8 px-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateUserAccess(
                                      u.id,
                                      u.role,
                                      'Aktif',
                                      'Penangguhan dicabut oleh Admin setelah verifikasi ulang.'
                                    );
                                    showToast(`Akun "${u.name}" telah diaktifkan kembali.`);
                                  }}
                                  className="h-8 px-2.5 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Pulihkan</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: INSPEKSI DOKUMEN & VALIDASI UMKM
         ========================================================================= */}
      {selectedUmkmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Pemeriksaan Dokumen Usaha UMKM
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedUmkmModal.storeName} · {selectedUmkmModal.ownerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUmkmModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF9F6] p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-400 block">Nomor Induk Berusaha (NIB)</span>
                <strong className="font-mono-tabular text-stone-900">
                  {selectedUmkmModal.nibNumber}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">NIK KTP Penanggung Jawab</span>
                <strong className="font-mono-tabular text-stone-900">
                  {selectedUmkmModal.ktpMasked}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Sertifikat Halal / PIRT</span>
                <strong className="font-mono-tabular text-stone-900">
                  {selectedUmkmModal.halalOrPirtNumber}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 block">Berkas Terlampir</span>
                <strong className="text-[#16382C] truncate block">
                  {selectedUmkmModal.docFileName}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-stone-400 block">Alamat Lokasi Dapur / Toko</span>
                <strong className="text-stone-900">
                  {selectedUmkmModal.address} ({selectedUmkmModal.district})
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Catatan Audit & Alasan Keputusan Admin
              </label>
              <textarea
                rows={3}
                value={umkmNoteInput}
                onChange={(e) => setUmkmNoteInput(e.target.value)}
                className="w-full p-3 text-xs bg-[#FAF9F6] border border-stone-300 rounded-xl focus:outline-none focus:border-[#16382C]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  onUpdateUmkmStatus(
                    selectedUmkmModal.id,
                    'Ditolak',
                    umkmNoteInput || 'Ditolak karena dokumen usaha tidak memenuhi syarat.'
                  );
                  showToast(`Pengajuan "${selectedUmkmModal.storeName}" telah Ditolak.`);
                  setSelectedUmkmModal(null);
                }}
                className="h-9 px-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Tolak Pengajuan
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateUmkmStatus(
                    selectedUmkmModal.id,
                    'Suspended',
                    umkmNoteInput || 'Akun UMKM ditangguhkan sementara (Suspended).'
                  );
                  showToast(`Akun "${selectedUmkmModal.storeName}" telah di-Suspend.`);
                  setSelectedUmkmModal(null);
                }}
                className="h-9 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Tangguhkan (Suspend)
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateUmkmStatus(
                    selectedUmkmModal.id,
                    'Verified',
                    umkmNoteInput || 'Dokumen usaha lengkap & terverifikasi (Verified).'
                  );
                  showToast(`UMKM "${selectedUmkmModal.storeName}" berhasil disetujui (Verified)!`);
                  setSelectedUmkmModal(null);
                }}
                className="h-9 px-4 rounded-xl bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
              >
                Setujui (Verified)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SIMULASI PENGAJUAN UMKM BARU
         ========================================================================= */}
      {showAddUmkmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 font-display">
                Tambah Pengajuan Verifikasi UMKM
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUmkmModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUmkmStore.trim() || !newUmkmOwner.trim()) return;
                const created: UmkmVerificationRecord = {
                  id: `umkm-ver-${Date.now()}`,
                  storeName: newUmkmStore.trim(),
                  ownerName: newUmkmOwner.trim(),
                  email: `${newUmkmStore
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')}@umkm.bandung.id`,
                  phone: '081223344556',
                  category: newUmkmCategory,
                  district: newUmkmDistrict,
                  address: `Jl. Raya ${newUmkmDistrict.split(' ')[0]} No. 21, Bandung`,
                  submittedAt: 'Baru saja · Hari ini',
                  status: 'Menunggu Verifikasi',
                  nibNumber: newUmkmNib.trim() || '9120558839201',
                  ktpMasked: '327301******0009',
                  halalOrPirtNumber: 'P-IRT 2063273091122-29',
                  docType: 'NIB & Sertifikat PIRT',
                  docFileName: `Berkas_${newUmkmStore.replace(/\s+/g, '_')}.pdf`,
                  storePhotoUrl:
                    '/src/assets/images/food_artisan_pastry_box_1794295651168.jpg',
                  hygieneCommitmentSigned: true,
                  adminNotes: 'Pengajuan baru masuk antrean verifikasi dokumen.',
                };
                onAddSimulatedUmkm(created);
                setNewUmkmStore('');
                setNewUmkmOwner('');
                setNewUmkmNib('');
                setShowAddUmkmModal(false);
                showToast(
                  `Pengajuan UMKM "${created.storeName}" masuk ke daftar Menunggu Verifikasi.`
                );
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Toko / Usaha UMKM
                </label>
                <input
                  type="text"
                  required
                  value={newUmkmStore}
                  onChange={(e) => setNewUmkmStore(e.target.value)}
                  placeholder="Contoh: Roti Kukus & Kopi Kosambi"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Pemilik / Penanggung Jawab
                </label>
                <input
                  type="text"
                  required
                  value={newUmkmOwner}
                  onChange={(e) => setNewUmkmOwner(e.target.value)}
                  placeholder="Contoh: Kang Lukman Hakim"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nomor NIB / SKU
                </label>
                <input
                  type="text"
                  value={newUmkmNib}
                  onChange={(e) => setNewUmkmNib(e.target.value)}
                  placeholder="Contoh: 9120558839201"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl font-mono-tabular"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUmkmModal(false)}
                  className="h-9 px-4 rounded-xl border border-stone-300 text-stone-700 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#16382C] text-white font-semibold cursor-pointer"
                >
                  Simpan ke Antrean Validasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: KONFIRMASI TAKE DOWN PRODUK BERMASALAH
         ========================================================================= */}
      {takedownModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-red-100">
              <div className="text-red-700">
                <h3 className="text-base font-bold font-display">
                  Nonaktifkan Produk (Take Down)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {takedownModalItem.title} · {takedownModalItem.merchantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTakedownModalItem(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Kategori Pelanggaran Keamanan Pangan / Etalase
                </label>
                <select
                  value={takedownReasonInput}
                  onChange={(e) => setTakedownReasonInput(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                >
                  <option value="Laporan Ketidaksesuaian Standar Keamanan Pangan / Risiko Basi">
                    Laporan Ketidaksesuaian Standar Keamanan Pangan / Risiko Basi
                  </option>
                  <option value="Melewati Batas Jam Konsumsi Aman Harian">
                    Melewati Batas Jam Konsumsi Aman Harian
                  </option>
                  <option value="Indikasi Manipulasi Harga Normal / Diskon Semu">
                    Indikasi Manipulasi Harga Normal / Diskon Semu
                  </option>
                  <option value="Deskripsi & Isi Paket Tidak Sesuai Ketentuan">
                    Deskripsi & Isi Paket Tidak Sesuai Ketentuan
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Catatan Instruksi untuk Mitra UMKM (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={takedownCustomNote}
                  onChange={(e) => setTakedownCustomNote(e.target.value)}
                  placeholder="Contoh: Mohon perbarui bukti suhu penyimpanan sebelum mengaktifkan produk kembali..."
                  className="w-full p-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakedownModalItem(null)}
                className="h-9 px-4 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const fullReason = takedownCustomNote.trim()
                    ? `${takedownReasonInput} (${takedownCustomNote.trim()})`
                    : takedownReasonInput;
                  onUpdateProductMonitoring(
                    takedownModalItem.id,
                    'Take Down',
                    fullReason
                  );
                  showToast(
                    `Produk "${takedownModalItem.title}" telah di-Take Down dari Etalase Publik.`
                  );
                  setTakedownModalItem(null);
                }}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Konfirmasi Take Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PUTUSAN PENYELESAIAN SENGKETA (DISPUTE RESOLUTION)
         ========================================================================= */}
      {selectedDispute && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Tindak Lanjut Sengketa #{selectedDispute.ticketCode}
                </h3>
                <p className="text-xs text-stone-500">
                  Pesanan #{selectedDispute.orderCode} · {selectedDispute.merchantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF9F6] border border-stone-200 rounded-xl p-3.5 text-xs space-y-1">
              <p className="font-semibold text-stone-900">
                Kategori: {selectedDispute.category}
              </p>
              <p className="text-stone-600">"{selectedDispute.description}"</p>
              <p className="text-stone-500 pt-1">
                Dana Pembeli Terkait:{' '}
                <strong className="font-mono-tabular text-stone-900">
                  {formatRupiah(selectedDispute.amountPaid)}
                </strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disputeAutoTakedown}
                  onChange={(e) => setDisputeAutoTakedown(e.target.checked)}
                  className="rounded border-stone-300 text-[#16382C]"
                />
                <span className="font-medium text-stone-800">
                  Otomatis Take Down produk "{selectedDispute.itemName}" dari etalase
                </span>
              </label>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Catatan Keputusan Resmi Admin
                </label>
                <textarea
                  rows={3}
                  value={disputeNoteInput}
                  onChange={(e) => setDisputeNoteInput(e.target.value)}
                  className="w-full p-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  onResolveDispute(
                    selectedDispute.id,
                    'Ditolak (Bukti Tidak Valid)',
                    disputeNoteInput || 'Laporan ditolak karena bukti tidak sesuai.',
                    false
                  );
                  showToast(
                    `Tiket #${selectedDispute.ticketCode} ditutup (Bukti Tidak Valid).`
                  );
                  setSelectedDispute(null);
                }}
                className="h-9 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Tolak Komplain
              </button>

              <button
                type="button"
                onClick={() => {
                  onResolveDispute(
                    selectedDispute.id,
                    'Selesai (Sanksi UMKM)',
                    disputeNoteInput ||
                      'Sanksi teguran keras diberikan ke mitra UMKM & produk dievaluasi.',
                    true,
                    disputeAutoTakedown ? selectedDispute.itemName : undefined
                  );
                  showToast(
                    `Tiket #${selectedDispute.ticketCode}: Sanksi UMKM diterapkan & Refund pembeli diproses.`
                  );
                  setSelectedDispute(null);
                }}
                className="h-9 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Sanksi UMKM & Refund
              </button>

              <button
                type="button"
                onClick={() => {
                  onResolveDispute(
                    selectedDispute.id,
                    'Selesai (Refund Pembeli)',
                    disputeNoteInput ||
                      'Dana dikembalikan penuh ke pembeli melalui gateway pembayaran.',
                    true,
                    disputeAutoTakedown ? selectedDispute.itemName : undefined
                  );
                  showToast(
                    `Tiket #${selectedDispute.ticketCode} selesai: Refund ${formatRupiah(
                      selectedDispute.amountPaid
                    )} diterbitkan.`
                  );
                  setSelectedDispute(null);
                }}
                className="h-9 px-4 rounded-xl bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
              >
                Setujui Refund Pembeli
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: UBAH ROLE & SANKSI HAK AKSES PENGGUNA
         ========================================================================= */}
      {selectedUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Atur Hak Akses & Sanksi Akun
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedUserModal.name} · {selectedUserModal.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateUserAccess(
                  selectedUserModal.id,
                  editUserRole,
                  editUserStatus,
                  editUserSanction.trim() || undefined
                );
                showToast(
                  `Hak akses "${selectedUserModal.name}" diperbarui menjadi Role: ${editUserRole} (${editUserStatus}).`
                );
                setSelectedUserModal(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Role Pengguna (Account Access Level)
                </label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                >
                  <option value="Buyer">Buyer (Pembeli Warga)</option>
                  <option value="UMKM">UMKM (Mitra Penjual Kuliner)</option>
                  <option value="Admin">Admin (Pengelola Platform)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Status Akun & Penegakan Disiplin
                </label>
                <select
                  value={editUserStatus}
                  onChange={(e) =>
                    setEditUserStatus(e.target.value as AccountStatus)
                  }
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                >
                  <option value="Aktif">Aktif (Normal)</option>
                  <option value="Peringatan (Warning)">
                    Peringatan (Warning / Pembatasan Kuota)
                  </option>
                  <option value="Suspended">
                    Suspended (Bekukan Akses Masuk & Transaksi)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Catatan Sanksi / Audit Hak Akses
                </label>
                <textarea
                  rows={3}
                  value={editUserSanction}
                  onChange={(e) => setEditUserSanction(e.target.value)}
                  placeholder="Tuliskan alasan perubahan role, pemberian peringatan, atau suspend akun..."
                  className="w-full p-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserModal(null)}
                  className="h-9 px-4 rounded-xl border border-stone-300 text-stone-700 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#16382C] hover:bg-emerald-900 text-white font-semibold cursor-pointer"
                >
                  Simpan Perubahan Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: TAMBAH AKUN PENGGUNA BARU
         ========================================================================= */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 font-display">
                Tambah Akun & tetapkan Role
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUserName.trim() || !newUserEmail.trim()) return;
                const created: UserAccessRecord = {
                  id: `usr-${Date.now()}`,
                  name: newUserName.trim(),
                  email: newUserEmail.trim(),
                  phone: newUserPhone.trim() || '081298765432',
                  role: newUserRole,
                  status: 'Aktif',
                  district: 'Coblong (Dago / Dipatiukur)',
                  joinedAt: 'Hari ini',
                  lastActive: 'Baru saja dibuat',
                  violationCount: 0,
                };
                onAddUserAccount(created);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserPhone('');
                setShowAddUserModal(false);
                showToast(
                  `Akun "${created.name}" dengan role ${created.role} berhasil ditambahkan.`
                );
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Lengkap / Nama Mitra
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Fauzan Hakim"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Contoh: fauzan@sisapiring.id"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl font-mono-tabular"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tetapkan Role Hak Akses
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 bg-[#FAF9F6] border border-stone-300 rounded-xl"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="UMKM">UMKM</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="h-9 px-4 rounded-xl border border-stone-300 text-stone-700 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#16382C] text-white font-semibold cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
