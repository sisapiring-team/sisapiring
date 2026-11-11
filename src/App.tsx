/**
 * SisaPiring — Dedicated Seller Portal & UMKM Dashboard
 * Exclusively localized for Bandung, Indonesia
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { SellerSidebar } from './components/layout/SellerSidebar';
import { SellerHeader } from './components/layout/SellerHeader';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { SellerDashboardView } from './components/dashboard/SellerDashboardView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { RescueDealsView } from './components/rescue/RescueDealsView';
import { QRPickupVerificationView } from './components/pickup/QRPickupVerificationView';
import { SalesAnalyticsView } from './components/analytics/SalesAnalyticsView';
import { StoreProfileView } from './components/profile/StoreProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { SellerRegistrationView } from './components/registration/SellerRegistrationView';
import { CustomerMarketplaceView } from './components/marketplace/CustomerMarketplaceView';

import { VerificationBadgeModal } from './components/common/VerificationBadgeModal';
import { FoodSafetyModal } from './components/products/FoodSafetyModal';
import { ProductFormModal } from './components/products/ProductFormModal';

const SellerPortalContent: React.FC = () => {
  const {
    activeTab,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    isFoodSafetyModalOpen,
    setIsFoodSafetyModalOpen,
    addProduct,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in marketplace mode, render the preserved Customer Marketplace experience
  if (activeTab === 'marketplace') {
    return (
      <>
        <CustomerMarketplaceView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] text-[#292929] overflow-hidden">
      {/* Desktop Sidebar (lg:flex) */}
      <div className="hidden lg:flex shrink-0">
        <SellerSidebar />
      </div>

      {/* Mobile Nav Drawer & Floating Bottom Bar */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <SellerHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 focus:outline-none">
          {activeTab === 'dashboard' && <SellerDashboardView />}
          {activeTab === 'products' && <ProductManagementView />}
          {activeTab === 'orders' && <OrderManagementView />}
          {activeTab === 'rescue_deals' && <RescueDealsView />}
          {activeTab === 'qr_pickup' && <QRPickupVerificationView />}
          {activeTab === 'analytics' && <SalesAnalyticsView />}
          {activeTab === 'profile' && <StoreProfileView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'registration' && <SellerRegistrationView />}
        </main>
      </div>

      {/* Global Modals for Interactive Merchant Actions */}
      <ProductFormModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={(data) => addProduct(data)}
      />

      <VerificationBadgeModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />

      <FoodSafetyModal
        isOpen={isFoodSafetyModalOpen}
        onClose={() => setIsFoodSafetyModalOpen(false)}
      />

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <SellerPortalContent />
    </AppProvider>
  );
}
