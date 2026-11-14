import React, { useState } from 'react';
import { AdminTab } from './admin/types';
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

interface AdminDashboardPageProps {
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => setActiveTab(tab);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 font-sans relative overflow-x-hidden selection:bg-[#8da249]/30 selection:text-neutral-900">

      {/* Top Floating Navbar */}
      <AdminFloatingNavbar
        onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        onSwitchToPublicEtalase={onSwitchToPublicEtalase}
        onSwitchToSellerPortal={onSwitchToSellerPortal}
        onSelectTab={setActiveTab}
      />

      {/* Desktop Floating Left Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
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
