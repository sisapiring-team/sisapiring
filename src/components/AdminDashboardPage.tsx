import React, { useState, useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  SisaPiringItem,
  ComplaintReport,
} from '../data/sisaPiringCatalog';
import { OrderRecord } from './RescueModals';
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

// Modular Admin Sub-Components
import { AdminTab, AdminMacroStats } from './admin/types';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminMobileDrawer } from './admin/AdminMobileDrawer';
import { AdminFloatingNavbar } from './admin/AdminFloatingNavbar';

// Modular Admin Tab Views
import { OverviewTab } from './admin/tabs/OverviewTab';
import { SellerGovernanceTab } from './admin/tabs/SellerGovernanceTab';
import { ProductCurationTab } from './admin/tabs/ProductCurationTab';
import { OrderEscrowTab } from './admin/tabs/OrderEscrowTab';
import { DisputesRefundTab } from './admin/tabs/DisputesRefundTab';
import { ReviewsModerationTab } from './admin/tabs/ReviewsModerationTab';
import { UserAccessTab } from './admin/tabs/UserAccessTab';

// Modular Admin Modals
import { UmkmVerificationModal } from './admin/modals/UmkmVerificationModal';
import { ProductTakedownModal } from './admin/modals/ProductTakedownModal';
import { DisputeResolutionModal } from './admin/modals/DisputeResolutionModal';
import { AddUserAccountModal } from './admin/modals/AddUserAccountModal';

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
  userAccounts,
  orders,
  onUpdateUmkmStatus,
  onUpdateProductMonitoring,
  onResolveDispute,
  onUpdateTransactionGateway,
  onUpdateUserAccess,
  onAddUserAccount,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
  onOpenPublicStore,
}) => {
  const { sellerProfile } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'all' | UmkmVerificationStatus>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | ProductMonitoringStatus>('all');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<'all' | DisputeStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Interactive Modal States
  const [selectedUmkmModal, setSelectedUmkmModal] = useState<UmkmVerificationRecord | null>(null);
  const [takedownModalItem, setTakedownModalItem] = useState<SisaPiringItem | null>(null);
  const [takedownReasonText, setTakedownReasonText] = useState(
    'Melanggar standar kesegaran & batas aman konsumsi (prep window).'
  );
  const [selectedDisputeModal, setSelectedDisputeModal] = useState<AdminDisputeRecord | null>(null);
  const [disputeResolutionNote, setDisputeResolutionNote] = useState(
    'Refund 100% diproses langsung ke rekening pembeli dari dana escrow platform.'
  );
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Notification Toast State
  const [adminToast, setAdminToast] = useState<{ title: string; message: string } | null>(null);
  const showToast = (title: string, message: string) => {
    setAdminToast({ title, message });
    window.setTimeout(() => setAdminToast(null), 3500);
  };

  // Macro Metrics (Bandung Aggregates - Dynamic LCA Calculation)
  const macroStats: AdminMacroStats = useMemo(() => {
    const period = MACRO_IMPACT_BY_PERIOD['30d'];
    const totalOrdersCount = orders.length + transactions.length;
    const totalRescuedPortions = orders.reduce(
      (acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0),
      period.totalPortionsRescued
    );

    // Algorithmic Derivation based on LCA & Bappenas Standards:
    // 1 portion = 0.45 kg food waste prevented
    // 1 kg food waste = 2.5 kg CO2e methane prevented from TPA Sarimukti
    // 1 kg food waste = 800 L virtual water footprint saved
    const dynamicWasteKg = Math.round(totalRescuedPortions * 0.45 * 10) / 10;
    const dynamicCo2Kg = Math.round(dynamicWasteKg * 2.5 * 10) / 10;
    const dynamicWaterLiters = Math.round(dynamicWasteKg * 800);

    const activeProductsCount = catalogItems.filter(
      (item) => (productMonitoring[item.id]?.monitoringStatus ?? 'Aktif & Aman') === 'Aktif & Aman'
    ).length;
    const pendingUmkmCount = umkmVerifications.filter(
      (u) => u.status === 'Menunggu Verifikasi'
    ).length;
    const openDisputesCount = disputes.filter(
      (d) => d.status === 'Sedang Ditinjau' || d.status === 'Investigasi Mitra'
    ).length;
    const totalEscrowHeld = transactions
      .filter((t) => t.gatewayStatus === 'Dana Ditahan (Escrow)')
      .reduce((acc, t) => acc + t.totalPaid, 0);

    return {
      period: {
        ...period,
        totalPortionsRescued: totalRescuedPortions,
        foodWastePreventedKg: dynamicWasteKg,
        co2EmissionsSavedKg: dynamicCo2Kg,
        waterSavedLiters: dynamicWaterLiters,
      },
      totalOrdersCount,
      totalRescuedPortions,
      activeProductsCount,
      pendingUmkmCount,
      openDisputesCount,
      totalEscrowHeld,
    };
  }, [orders, transactions, catalogItems, productMonitoring, umkmVerifications, disputes]);

  // Combined Seller Data
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

  // Combined Products
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

  // Combined Disputes
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

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-neutral-900 font-sans relative overflow-x-hidden selection:bg-amber-400/30 selection:text-neutral-900">
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
            className="ml-2 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP FLOATING NAVBAR (RESTORED MATCHING REFERENCE DESIGN) */}
      <AdminFloatingNavbar
        macroStats={macroStats}
        onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        onSwitchToPublicEtalase={onSwitchToPublicEtalase}
        onSwitchToSellerPortal={onSwitchToSellerPortal}
        onSelectTab={setActiveTab}
      />

      {/* 2. DESKTOP FLOATING LEFT SIDEBAR (TWO SEPARATE CAPSULES) */}
      <div className="hidden lg:block">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          macroStats={macroStats}
          onSwitchToPublicEtalase={onSwitchToPublicEtalase}
          onSwitchToSellerPortal={onSwitchToSellerPortal}
        />
      </div>

      {/* 3. MOBILE DRAWER NAVIGATION */}
      <AdminMobileDrawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        macroStats={macroStats}
        onSwitchToPublicEtalase={onSwitchToPublicEtalase}
        onSwitchToSellerPortal={onSwitchToSellerPortal}
      />

      {/* 4. MAIN SCROLLABLE CONTENT AREA (Full-width, flush with sidebar & right edge) */}
      <main className="pt-20 sm:pt-24 px-4 lg:pl-[84px] xl:pl-[96px] lg:pr-4 pb-12 w-full relative z-10 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              macroStats={macroStats}
              umkmVerifications={umkmVerifications}
              onSelectTab={setActiveTab}
              onExportCSV={handleExportCSV}
              onFilterPendingUmkm={() => {
                setActiveTab('seller-governance');
                setSellerStatusFilter('Menunggu Verifikasi');
              }}
            />
          )}

          {activeTab === 'seller-governance' && (
            <SellerGovernanceTab
              displayUmkmList={displayUmkmList}
              sellerStatusFilter={sellerStatusFilter}
              onStatusFilterChange={setSellerStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sellerProfile={sellerProfile}
              onSelectUmkm={setSelectedUmkmModal}
              onOpenPublicStore={onOpenPublicStore}
              onSwitchToSellerPortal={onSwitchToSellerPortal}
            />
          )}

          {activeTab === 'product-curation' && (
            <ProductCurationTab
              displayProducts={displayProducts}
              productMonitoring={productMonitoring}
              productStatusFilter={productStatusFilter}
              onStatusFilterChange={setProductStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRestoreProduct={(itemId, title) => {
                onUpdateProductMonitoring(itemId, 'Aktif & Aman');
                showToast('Produk Dipulihkan', `"${title}" kembali tayang di etalase.`);
              }}
              onRequestTakedown={setTakedownModalItem}
            />
          )}

          {activeTab === 'order-escrow' && (
            <OrderEscrowTab
              transactions={transactions}
              orders={orders}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              macroStats={macroStats}
              onReleaseEscrow={(trx) => {
                onUpdateTransactionGateway(
                  trx.id,
                  'Selesai (Settled)',
                  'Dilepaskan secara manual oleh Admin setelah audit serah terima barang.'
                );
                showToast('Escrow Dicairkan', `Dana pesanan ${trx.orderCode} diteruskan ke UMKM.`);
              }}
            />
          )}

          {activeTab === 'disputes-refund' && (
            <DisputesRefundTab
              displayDisputes={displayDisputes}
              disputeStatusFilter={disputeStatusFilter}
              onStatusFilterChange={setDisputeStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectDispute={setSelectedDisputeModal}
              onRejectDispute={(dispute) => {
                onResolveDispute(
                  dispute.id,
                  'Ditolak (Bukti Tidak Valid)',
                  'Bukti tidak memenuhi kriteria komplain garansi mutu makanan.'
                );
                showToast('Laporan Ditolak', `Tiket #${dispute.ticketCode} ditutup.`);
              }}
            />
          )}

          {activeTab === 'reviews-moderation' && <ReviewsModerationTab />}

          {activeTab === 'user-access' && (
            <UserAccessTab
              displayUsers={displayUsers}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
              onToggleUserStatus={(u) => {
                if (u.status === 'Aktif') {
                  onUpdateUserAccess(u.id, u.role, 'Suspended', 'Dibekukan oleh Admin');
                  showToast('Akun Dibekukan', `Akun ${u.name} dinonaktifkan.`);
                } else {
                  onUpdateUserAccess(u.id, u.role, 'Aktif');
                  showToast('Akun Dipulihkan', `Akun ${u.name} aktif kembali.`);
                }
              }}
            />
          )}
        </main>

      {/* 4. Interactive Dialog Modals */}
      <UmkmVerificationModal
        umkm={selectedUmkmModal}
        onClose={() => setSelectedUmkmModal(null)}
        onApprove={(umkm) => {
          onUpdateUmkmStatus(
            umkm.id,
            'Verified',
            'Semua berkas legalitas dan uji higienitas disetujui.'
          );
          showToast('Mitra Disetujui', `${umkm.storeName} resmi berstatus Verified.`);
          setSelectedUmkmModal(null);
        }}
        onReject={(umkm) => {
          onUpdateUmkmStatus(
            umkm.id,
            'Ditolak',
            'Dokumen belum lengkap / perlu pembaharuan.'
          );
          showToast('Verifikasi Ditolak', `Status ${umkm.storeName} diubah.`);
          setSelectedUmkmModal(null);
        }}
      />

      <ProductTakedownModal
        item={takedownModalItem}
        reason={takedownReasonText}
        onReasonChange={setTakedownReasonText}
        onClose={() => setTakedownModalItem(null)}
        onConfirmTakedown={(item, reason) => {
          onUpdateProductMonitoring(item.id, 'Take Down', reason);
          showToast('Produk Di-Takedown', `"${item.title}" dinonaktifkan dari etalase.`);
          setTakedownModalItem(null);
        }}
      />

      <DisputeResolutionModal
        dispute={selectedDisputeModal}
        resolutionNote={disputeResolutionNote}
        onResolutionNoteChange={setDisputeResolutionNote}
        onClose={() => setSelectedDisputeModal(null)}
        onProcessRefund={(dispute, note) => {
          onResolveDispute(
            dispute.id,
            'Selesai (Refund Pembeli)',
            note,
            true,
            dispute.itemName
          );
          showToast(
            'Refund Berhasil',
            `Dana ${dispute.amountPaid} dikembalikan ke pembeli.`
          );
          setSelectedDisputeModal(null);
        }}
        onIssueSanction={(dispute) => {
          onResolveDispute(
            dispute.id,
            'Selesai (Sanksi UMKM)',
            'Sanksi peringatan diterbitkan ke gerai terkait.',
            false
          );
          showToast('Sanksi Diterbitkan', `Peringatan dikirim ke ${dispute.merchantName}.`);
          setSelectedDisputeModal(null);
        }}
      />

      <AddUserAccountModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSaveUser={(userData) => {
          onAddUserAccount({
            id: `usr-${Date.now().toString().slice(-4)}`,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            status: 'Aktif',
            district: userData.district,
            joinedAt: 'Hari ini',
            lastActive: 'Baru saja',
            violationCount: 0,
          });
          showToast('Akun Ditambahkan', `Akun ${userData.name} berhasil dibuat.`);
        }}
      />
    </div>
  );
};
