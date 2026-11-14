import React, { useState, useMemo } from 'react';
import { AdminTab, AdminMacroStats } from './admin/types';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminMobileDrawer } from './admin/AdminMobileDrawer';
import { AdminFloatingNavbar } from './admin/AdminFloatingNavbar';
import { OverviewTab } from './admin/tabs/OverviewTab';
import { SellerGovernanceTab } from './admin/tabs/SellerGovernanceTab';
import { ProductCurationTab } from './admin/tabs/ProductCurationTab';
import { OrderEscrowTab } from './admin/tabs/OrderEscrowTab';
import { DisputesRefundTab } from './admin/tabs/DisputesRefundTab';
import { ReviewsModerationTab } from './admin/tabs/ReviewsModerationTab';
import { UserAccessTab } from './admin/tabs/UserAccessTab';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

interface AdminDashboardPageProps {
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
  currentUser?: { name: string; email: string; role?: string } | null;
  onLogout?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { stats } = useAdminDashboard();

  const macroStats: AdminMacroStats = useMemo(() => ({
    totalOrdersCount: stats?.orders ?? 0,
    totalRescuedPortions: stats?.impact?.totalPortions ?? 0,
    activeProductsCount: stats?.productsUnderReview ?? 0,
    pendingUmkmCount: stats?.merchantsPending ?? 0,
    openDisputesCount: stats?.openDisputes ?? 0,
    totalEscrowHeld: stats?.revenue ?? 0,
  }), [stats]);

  const handleTabChange = (tab: AdminTab) => setActiveTab(tab);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 font-sans relative overflow-x-hidden selection:bg-[#8da249]/30 selection:text-neutral-900">

      {/* Top Floating Navbar */}
      <AdminFloatingNavbar
        onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        onSwitchToPublicEtalase={onSwitchToPublicEtalase}
        onSwitchToSellerPortal={onSwitchToSellerPortal}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Desktop Floating Left Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          macroStats={macroStats}
          onSwitchToPublicEtalase={onSwitchToPublicEtalase}
          onSwitchToSellerPortal={onSwitchToSellerPortal}
        />
      </div>

      {/* Mobile Drawer */}
      <AdminMobileDrawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        macroStats={macroStats}
        onSwitchToPublicEtalase={onSwitchToPublicEtalase}
        onSwitchToSellerPortal={onSwitchToSellerPortal}
      />

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 px-4 lg:pl-[84px] xl:pl-[96px] lg:pr-4 pb-12 w-full relative z-10 space-y-6">
        {activeTab === 'overview'           && <OverviewTab onSelectTab={setActiveTab} />}
        {activeTab === 'seller-governance'  && <SellerGovernanceTab onSwitchToSellerPortal={onSwitchToSellerPortal} />}
        {activeTab === 'product-curation'   && <ProductCurationTab />}
        {activeTab === 'order-escrow'       && <OrderEscrowTab />}
        {activeTab === 'disputes-refund'    && <DisputesRefundTab />}
        {activeTab === 'reviews-moderation' && <ReviewsModerationTab />}
        {activeTab === 'user-access'        && <UserAccessTab />}
      </main>
    </div>
  );
};
