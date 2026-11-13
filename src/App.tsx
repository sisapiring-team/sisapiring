
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { SellerSidebar } from './components/layout/SellerSidebar';
import { SellerHeader } from './components/layout/SellerHeader';
import { MobileNav } from './components/layout/MobileNav';

// Seller Views
import { SellerDashboardView } from './components/dashboard/SellerDashboardView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { RescueDealsView } from './components/rescue/RescueDealsView';
import { QRPickupVerificationView } from './components/pickup/QRPickupVerificationView';
import { SalesAnalyticsView } from './components/analytics/SalesAnalyticsView';
import { StoreProfileView } from './components/profile/StoreProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { SellerRegistrationView } from './components/registration/SellerRegistrationView';

import { VerificationBadgeModal } from './components/common/VerificationBadgeModal';
import { FoodSafetyModal } from './components/products/FoodSafetyModal';
import { ProductFormModal } from './components/products/ProductFormModal';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  MapPin,
  Clock,
  LogOut,
  User,
  Settings,
  Home,
  ClipboardList,
  History as HistoryIcon,
  RotateCcw,
  Store,
  Star,
  ShieldAlert,
  Package,
  Upload,
  X,
  ShieldCheck,
  MessageSquare,
  Menu,
} from 'lucide-react';
import {
  SISA_PIRING_CATALOG,
  MERCHANT_STORIES,
  HERO_IMAGE_PATH,
  PARTNER_PORTRAIT_PATH,
  INITIAL_STORE_REVIEWS,
  SisaPiringItem,
  StoreReview,
  ComplaintReport,
  formatRupiah,
} from './data/sisaPiringCatalog';
import {
  INITIAL_UMKM_VERIFICATIONS,
  INITIAL_PRODUCT_MONITORING,
  INITIAL_ADMIN_DISPUTES,
  INITIAL_ADMIN_TRANSACTIONS,
  INITIAL_DISCOUNT_HISTORY,
  INITIAL_USER_ACCESS_LIST,
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
  mapComplaintToAdminDispute,
} from './data/adminData';
import { ResilientImage } from './components/ResilientImage';
import {
  ProductDetailModal,
  RescueCartPage,
  CartEntry,
  OrderRecord,
} from './components/RescueModals';
import { MarketplaceDisplayPage } from './components/MarketplaceDisplayPage';
import { StoreCatalogPage } from './components/StoreCatalogPage';
import { AuthPage, UserAccount } from './components/AuthPage';
import { fetchCatalog } from './lib/api';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { ChatContainerPage } from './components/chat/ChatContainerPage';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { BotChatView } from './components/chat/BotChatView';
import { parseRoute, pushRoute } from './utils/navigation';
import { Footer } from './components/Footer';
import { FoodWasteFunFacts } from './components/FoodWasteFunFacts';

const DELIVERY_STAGES: {
  key: OrderRecord['deliveryStage'];
  label: string;
  desc: string;
}[] = [
  {
    key: 'diterima',
    label: 'Diterima',
    desc: 'Pesanan & pembayaran telah diterima oleh toko UMKM dan sedang dikemas.',
  },
  {
    key: 'diambil',
    label: 'Diambil',
    desc: 'Paket penyelamatan makanan telah diambil dari kasir mitra UMKM.',
  },
  {
    key: 'perjalanan',
    label: 'Perjalanan',
    desc: 'Pesanan sedang dalam perjalanan menuju alamat tujuan Anda di Bandung.',
  },
  {
    key: 'sampai',
    label: 'Sampai',
    desc: 'Pesanan telah sampai di lokasi tujuan. Silakan periksa makanan & beri ulasan.',
  },
];

function CustomerAndAdminPortal() {
  const {
    activeTab,
    setActiveTab,
    products: sellerProducts,
    orders: sellerOrders,
    registerCustomerOrder,
    updateProduct,
    setVerificationStatus,
  } = useApp();
  // Active Page View ('admin' | 'etalase' | 'landing' | 'kantong' | 'auth' | 'pesanan' | 'history' | 'store' | 'chat' | 'chat-bot')
  const [activePage, setActivePage] = useState<
    'admin' | 'landing' | 'etalase' | 'kantong' | 'auth' | 'pesanan' | 'history' | 'store' | 'chat' | 'chat-bot'
  >(() => {
    if (typeof window !== 'undefined') {
      const route = parseRoute(window.location.pathname);
      if (route.page === 'admin') return 'admin';
      if (
        route.page === 'landing' ||
        route.page === 'etalase' ||
        route.page === 'kantong' ||
        route.page === 'pesanan' ||
        route.page === 'history' ||
        route.page === 'store' ||
        route.page === 'chat' ||
        route.page === 'chat-bot' ||
        route.page === 'auth'
      ) {
        return route.page;
      }
    }
    return activeTab === 'admin' ? 'admin' : 'landing';
  });

  // Sync activeTab with activePage for direct routing between Seller, Customer, and Admin portals
  useEffect(() => {
    if (activeTab === 'admin') {
      setActivePage('admin');
    } else if (activeTab === 'marketplace' && activePage === 'admin') {
      setActivePage('etalase');
    }
  }, [activeTab, activePage]);

  // Synchronize state when browser Back or Forward is pressed
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute(window.location.pathname);
      if (route.page === 'admin') {
        setActiveTab('admin');
        setActivePage('admin');
      } else if (route.page === 'penjual') {
        // Handled in AppProvider
      } else {
        setActiveTab('marketplace');
        if (route.page === 'store' && route.merchantName) {
          setSelectedStoreName(route.merchantName);
        }
        if (route.page === 'chat') {
          setChatTargetMerchant(route.merchantName);
        }
        if (
          route.page === 'landing' ||
          route.page === 'etalase' ||
          route.page === 'kantong' ||
          route.page === 'pesanan' ||
          route.page === 'history' ||
          route.page === 'store' ||
          route.page === 'chat' ||
          route.page === 'chat-bot' ||
          route.page === 'auth'
        ) {
          setActivePage(route.page);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab]);

  const [returnPageAfterAuth, setReturnPageAfterAuth] = useState<
    'admin' | 'landing' | 'etalase' | 'kantong' | 'pesanan' | 'history' | 'store' | 'chat' | 'chat-bot'
  >('etalase');

  const [chatTargetMerchant, setChatTargetMerchant] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const route = parseRoute(window.location.pathname);
      if (route.page === 'chat' && route.merchantName) {
        return route.merchantName;
      }
    }
    return undefined;
  });

  const [selectedStoreName, setSelectedStoreName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const route = parseRoute(window.location.pathname);
      if (route.page === 'store' && route.merchantName) {
        return route.merchantName;
      }
    }
    return SISA_PIRING_CATALOG[0].merchantName;
  });
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>(
    INITIAL_STORE_REVIEWS
  );
  const [complaints, setComplaints] = useState<ComplaintReport[]>([]);
  const [orderReviewModal, setOrderReviewModal] = useState<OrderRecord | null>(null);
  const [orderComplaintModal, setOrderComplaintModal] = useState<OrderRecord | null>(null);
  const [modalRatingValue, setModalRatingValue] = useState<number>(5);
  const [modalReviewText, setModalReviewText] = useState<string>('');
  const [modalReviewTags, setModalReviewTags] = useState<string[]>([
    'Sesuai Deskripsi',
    'Masih Hangat & Segar',
  ]);
  const [modalComplaintCat, setModalComplaintCat] = useState<
    ComplaintReport['category']
  >('Makanan Tidak Sesuai Deskripsi');
  const [modalComplaintDesc, setModalComplaintDesc] = useState<string>('');
  const [modalComplaintFile, setModalComplaintFile] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [accountModalMode, setAccountModalMode] = useState<'address' | 'profile' | null>(null);
  const [editAddressText, setEditAddressText] = useState<string>('');
  const [editDistrictText, setEditDistrictText] = useState<string>('Coblong (Dago / Dipatiukur)');
  const [editNameText, setEditNameText] = useState<string>('');
  const [editPhoneText, setEditPhoneText] = useState<string>('');

  // Dynamic Catalog State & Admin Governance States
  const [catalogItems, setCatalogItems] = useState<SisaPiringItem[]>(SISA_PIRING_CATALOG);

  // Load the live marketplace catalog from the Laravel API, keeping the bundled
  // sample catalog as a resilient fallback when the backend is unavailable.
  useEffect(() => {
    let active = true;

    fetchCatalog()
      .then((items) => {
        if (active && items.length > 0) {
          setCatalogItems(items);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);
  const [productMonitoring, setProductMonitoring] = useState<
    Record<string, ProductMonitoringMeta>
  >(INITIAL_PRODUCT_MONITORING);
  const [umkmVerifications, setUmkmVerifications] = useState<
    UmkmVerificationRecord[]
  >(INITIAL_UMKM_VERIFICATIONS);
  const [adminDisputes, setAdminDisputes] = useState<AdminDisputeRecord[]>(
    INITIAL_ADMIN_DISPUTES
  );
  const [adminTransactions, setAdminTransactions] = useState<
    AdminTransactionRecord[]
  >(INITIAL_ADMIN_TRANSACTIONS);
  const [discountHistory, setDiscountHistory] = useState<
    DiscountHistoryEntry[]
  >(INITIAL_DISCOUNT_HISTORY);
  const [userAccounts, setUserAccounts] = useState<UserAccessRecord[]>(
    INITIAL_USER_ACCESS_LIST
  );

  // Interactive Cart & Modal States
  const [cart, setCart] = useState<CartEntry[]>([
    { item: SISA_PIRING_CATALOG[0], quantity: 1 },
  ]);
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      orderCode: 'SP-8421',
      createdAt: 'Hari ini · 16.40 WIB',
      name: 'Nabil Rachman',
      phone: '081234567890',
      payment: 'qris',
      totalPaid: SISA_PIRING_CATALOG[0].rescuePrice,
      totalSaved: SISA_PIRING_CATALOG[0].originalPrice - SISA_PIRING_CATALOG[0].rescuePrice,
      status: 'siap-diambil',
      deliveryStage: 'perjalanan',
      items: [{ item: SISA_PIRING_CATALOG[0], quantity: 1 }],
    },
    {
      orderCode: 'SP-7109',
      createdAt: 'Kemarin · 19.15 WIB',
      name: 'Nabil Rachman',
      phone: '081234567890',
      payment: 'qris',
      totalPaid: SISA_PIRING_CATALOG[2].rescuePrice,
      totalSaved: SISA_PIRING_CATALOG[2].originalPrice - SISA_PIRING_CATALOG[2].rescuePrice,
      status: 'selesai',
      deliveryStage: 'sampai',
      userRating: 5,
      items: [{ item: SISA_PIRING_CATALOG[2], quantity: 1 }],
    },
    {
      orderCode: 'SP-6542',
      createdAt: '7 Nov 2026 · 18.50 WIB',
      name: 'Nabil Rachman',
      phone: '081234567890',
      payment: 'cod',
      totalPaid: SISA_PIRING_CATALOG[1].rescuePrice * 2,
      totalSaved: (SISA_PIRING_CATALOG[1].originalPrice - SISA_PIRING_CATALOG[1].rescuePrice) * 2,
      status: 'selesai',
      deliveryStage: 'sampai',
      items: [{ item: SISA_PIRING_CATALOG[1], quantity: 2 }],
    },
  ]);
  const [activeProductModal, setActiveProductModal] = useState<SisaPiringItem | null>(null);
  const [recentToast, setRecentToast] = useState<string | null>(null);

  // Two-way synchronization: If Seller updates order in Seller Portal (Confirmed, Ready for Pickup, QR Verified / Completed),
  // update the corresponding customer order in Customer Marketplace
  React.useEffect(() => {
    setOrders((prevCustomerOrders) =>
      prevCustomerOrders.map((custOrder) => {
        const matchedSellerOrder = sellerOrders.find(
          (so) => so.pickupCode === custOrder.orderCode || so.id === custOrder.orderCode
        );
        if (!matchedSellerOrder) return custOrder;

        let nextStage = custOrder.deliveryStage;
        let nextStatus = custOrder.status;

        if (matchedSellerOrder.status === 'confirmed') {
          nextStage = 'diterima';
          nextStatus = 'siap-diambil';
        } else if (matchedSellerOrder.status === 'ready_for_pickup') {
          nextStage = 'perjalanan';
          nextStatus = 'siap-diambil';
        } else if (matchedSellerOrder.status === 'completed' || matchedSellerOrder.isVerifiedByQR) {
          nextStage = 'sampai';
          nextStatus = 'selesai';
        }

        if (nextStage !== custOrder.deliveryStage || nextStatus !== custOrder.status) {
          return {
            ...custOrder,
            deliveryStage: nextStage,
            status: nextStatus,
          };
        }
        return custOrder;
      })
    );
  }, [sellerOrders]);

  // Two-way synchronization: If Seller adjusts product price/discount in Seller Portal (Rescue Deals),
  // update the product in Customer Marketplace catalog
  React.useEffect(() => {
    setCatalogItems((prevItems) =>
      prevItems.map((item) => {
        const sellerProduct = sellerProducts.find((sp) => sp.id === item.id);
        if (sellerProduct) {
          return {
            ...item,
            originalPrice: sellerProduct.originalPrice,
            rescuePrice: sellerProduct.discountedPrice,
            discountPercent: sellerProduct.discountPercentage,
            remainingStock: sellerProduct.stock,
          };
        }
        return item;
      })
    );
  }, [sellerProducts]);

  // Partner Lead Capture Form State (on Landing Page)
  const [registrationRole, setRegistrationRole] = useState<'mitra' | 'warga'>('mitra');
  const [leadName, setLeadName] = useState('');
  const [leadBusinessOrArea, setLeadBusinessOrArea] = useState('');
  const [leadDistrict, setLeadDistrict] = useState('Coblong (Dago / Dipatiukur)');
  const [leadContact, setLeadContact] = useState('');
  const [leadPortions, setLeadPortions] = useState('5–15 porsi / hari');
  const [leadError, setLeadError] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const totalCartItems = useMemo(
    () => cart.reduce((acc, entry) => acc + entry.quantity, 0),
    [cart]
  );

  const handleAddToCart = (item: SisaPiringItem, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((e) => e.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = Math.min(
          item.remainingStock,
          updated[existingIndex].quantity + qty
        );
        updated[existingIndex] = { item, quantity: nextQty };
        return updated;
      }
      return [...prev, { item, quantity: Math.min(item.remainingStock, qty) }];
    });

    setRecentToast(`${qty}x ${item.title} masuk Kantong`);
    window.setTimeout(() => {
      setRecentToast((prev) =>
        prev?.includes(item.title) ? null : prev
      );
    }, 3000);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) => {
          if (entry.item.id !== id) return entry;
          const nextQty = Math.min(
            entry.item.remainingStock,
            entry.quantity + delta
          );
          return nextQty > 0 ? { ...entry, quantity: nextQty } : null;
        })
        .filter((entry): entry is CartEntry => entry !== null)
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((e) => e.item.id !== id));
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || leadName.trim().length < 2) {
      setLeadError('Mohon masukkan nama lengkap Anda.');
      return;
    }
    if (!leadBusinessOrArea.trim()) {
      setLeadError(
        registrationRole === 'mitra'
          ? 'Mohon cantumkan nama usaha kuliner UMKM Anda.'
          : 'Mohon cantumkan kecamatan tempat tinggal Anda.'
      );
      return;
    }
    const cleanContact = leadContact.replace(/\D/g, '');
    if (cleanContact.length < 9 && !leadContact.includes('@')) {
      setLeadError('Mohon masukkan nomor WhatsApp aktif atau alamat email yang valid.');
      return;
    }

    setLeadError('');
    setLeadSubmitted(true);
  };

  const navigateToSection = (sectionId: string) => {
    if (activePage !== 'landing') {
      pushRoute('/');
      setActiveTab('marketplace');
      setActivePage('landing');
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openLandingPage = () => {
    pushRoute('/');
    setActiveTab('marketplace');
    setActivePage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEtalasePage = () => {
    pushRoute('/etalase');
    setActiveTab('marketplace');
    setActivePage('etalase');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCartPage = () => {
    pushRoute('/kantong');
    setActivePage('kantong');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrdersPage = () => {
    pushRoute('/pesanan');
    setActiveTab('marketplace');
    setActivePage('pesanan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openHistoryPage = () => {
    pushRoute('/history');
    setActiveTab('marketplace');
    setActivePage('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openChatPage = (merchantName?: string) => {
    pushRoute(merchantName ? `/chat/${encodeURIComponent(merchantName)}` : '/chat');
    setChatTargetMerchant(merchantName);
    setActiveTab('marketplace');
    setActivePage('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openChatBotPage = () => {
    pushRoute('/chat/bot');
    setActiveTab('marketplace');
    setActivePage('chat-bot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStorePage = (merchantName: string) => {
    pushRoute(`/toko/${encodeURIComponent(merchantName)}`);
    setSelectedStoreName(merchantName);
    setActivePage('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAdminPage = () => {
    pushRoute('/admin');
    setActiveTab('admin');
    setActivePage('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSellerPage = (subTab?: string) => {
    pushRoute(subTab && subTab !== 'dashboard' ? `/penjual/${subTab}` : '/penjual');
    setActiveTab((subTab as any) || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthPage = () => {
    pushRoute('/auth');
    if (activePage !== 'auth') {
      setReturnPageAfterAuth(activePage);
    }
    setActivePage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccessLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setOrders((prev) =>
      prev.map((o) => ({
        ...o,
        name: user.name,
        phone: user.phone,
      }))
    );
    const target = returnPageAfterAuth || 'etalase';
    if (target === 'landing') openLandingPage();
    else if (target === 'etalase') openEtalasePage();
    else if (target === 'kantong') openCartPage();
    else if (target === 'pesanan') openOrdersPage();
    else if (target === 'history') openHistoryPage();
    else if (target === 'chat') openChatPage();
    else if (target === 'chat-bot') openChatBotPage();
    else if (target === 'admin') openAdminPage();
    else openEtalasePage();
    window.setTimeout(() => {
      setRecentToast((prev) => (prev?.includes(user.name) ? null : prev));
    }, 3000);
  };

  const handleOrderCreated = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    const firstEntry = newOrder.items[0];
    if (firstEntry) {
      const newTrx: AdminTransactionRecord = {
        id: `trx-${Date.now()}`,
        orderCode: newOrder.orderCode,
        timestamp: newOrder.createdAt,
        buyerName: newOrder.name,
        merchantName: firstEntry.item.merchantName,
        itemTitle: firstEntry.item.title,
        quantity: firstEntry.quantity,
        reportedNormalPrice: firstEntry.item.originalPrice,
        verifiedBaselinePrice: firstEntry.item.originalPrice,
        rescuePrice: firstEntry.item.rescuePrice,
        reportedDiscountPercent: firstEntry.item.discountPercent,
        realDiscountPercent: firstEntry.item.discountPercent,
        totalPaid: newOrder.totalPaid,
        paymentMethod:
          newOrder.payment === 'qris'
            ? 'QRIS Terintegrasi'
            : 'COD Kasir Mitra',
        paymentGatewayRef: `${newOrder.payment.toUpperCase()}-BDG-${Date.now()
          .toString()
          .slice(-4)}`,
        gatewayStatus:
          newOrder.payment === 'qris'
            ? 'Dana Ditahan (Escrow)'
            : 'Selesai (Settled)',
        manipulationFlag: 'Aman',
      };
      setAdminTransactions((prev) => [newTrx, ...prev]);
    }

    // Two-way synchronization: Bridge order to Seller Portal
    registerCustomerOrder({
      id: `SP-BDG-2026-${Math.floor(100 + Math.random() * 900)}`,
      pickupCode: newOrder.orderCode,
      customerName: newOrder.name,
      customerPhone: newOrder.phone,
      items: newOrder.items.map(({ item, quantity }) => ({
        productId: item.id,
        productName: item.title,
        category: (item.category === 'Roti'
          ? 'Bakery & Roti'
          : item.category === 'Nasi & Lauk'
          ? 'Katering & Nasi Kotak'
          : 'Kue & Pastry') as any,
        pricePerItem: item.rescuePrice,
        quantity,
        image: item.imageUrl,
      })),
      totalPayment: newOrder.totalPaid,
      orderDate: newOrder.createdAt,
      pickupDeadline: 'Hari ini, 21:30 WIB',
      status: 'waiting_confirmation',
      statusHistory: [
        {
          status: 'waiting_confirmation',
          timestamp: newOrder.createdAt,
          note: 'Pesanan masuk dari etalase pelanggan SisaPiring',
        },
      ],
      isVerifiedByQR: false,
    });
  };


  const handleAddStoreReview = (newRev: Omit<StoreReview, 'id' | 'date'>) => {
    const created: StoreReview = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: 'Hari ini · Baru saja',
    };
    setStoreReviews((prev) => [created, ...prev]);
  };

  const handleAddComplaint = (
    newComp: Omit<ComplaintReport, 'id' | 'ticketCode' | 'createdAt' | 'status'>
  ) => {
    const ticketCode = `KL-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: ComplaintReport = {
      ...newComp,
      id: `comp-${Date.now()}`,
      ticketCode,
      createdAt: 'Hari ini · Baru saja',
      status: 'Sedang Ditinjau',
    };
    setComplaints((prev) => [created, ...prev]);
    setAdminDisputes((prev) => [mapComplaintToAdminDispute(created), ...prev]);
    setRecentToast(`Laporan #${ticketCode} berhasil dikirim ke Tim Keamanan`);
    window.setTimeout(() => setRecentToast(null), 3000);
  };

  // Admin Governance Handlers
  const handleUpdateUmkmStatus = (
    id: string,
    status: UmkmVerificationStatus,
    notes: string
  ) => {
    setUmkmVerifications((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status, adminNotes: notes } : u
      )
    );
    if (id === 'umkm-ver-00') {
      setVerificationStatus(
        status === 'Verified'
          ? 'verified'
          : status === 'Ditolak'
          ? 'rejected'
          : 'pending_review',
        notes
      );
    }
  };

  const handleAddSimulatedUmkm = (record: UmkmVerificationRecord) => {
    setUmkmVerifications((prev) => [record, ...prev]);
  };

  const handleUpdateProductMonitoring = (
    itemId: string,
    status: ProductMonitoringStatus,
    reason?: string
  ) => {
    setProductMonitoring((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {
          itemId,
          reportCount: 0,
          safetyFlag: 'Aman',
          prepWindowVerified: true,
        }),
        monitoringStatus: status,
        lastCheckedAt: 'Baru saja · Oleh Admin',
        takedownReason: status === 'Take Down' ? reason : undefined,
      },
    }));
    if (status === 'Take Down') {
      updateProduct(itemId, { isActive: false });
    } else if (status === 'Aktif & Aman') {
      updateProduct(itemId, { isActive: true });
    }
  };

  const handleCorrectProductPrice = (
    itemId: string,
    correctedOriginalPrice: number,
    discountEntryId: string
  ) => {
    setCatalogItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextDiscount = Math.round(
          ((correctedOriginalPrice - item.rescuePrice) /
            correctedOriginalPrice) *
            100
        );
        return {
          ...item,
          originalPrice: correctedOriginalPrice,
          discountPercent: nextDiscount,
        };
      })
    );
    updateProduct(itemId, { originalPrice: correctedOriginalPrice });
    setDiscountHistory((prev) =>
      prev.map((dh) =>
        dh.id === discountEntryId
          ? {
              ...dh,
              submittedNormalPrice: correctedOriginalPrice,
              claimedDiscountPercent: dh.actualDiscountFromBaseline,
              markupDeviationPercent: 0,
              status: 'Harga Dikoreksi Admin',
            }
          : dh
      )
    );
  };

  const handleResolveDispute = (
    disputeId: string,
    nextStatus: DisputeStatus,
    resolutionNote: string,
    triggerRefund?: boolean,
    takedownItemName?: string
  ) => {
    const targetDispute = adminDisputes.find((d) => d.id === disputeId);
    setAdminDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: nextStatus, adminResolutionNote: resolutionNote }
          : d
      )
    );
    if (targetDispute) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.ticketCode === targetDispute.ticketCode
            ? { ...c, status: 'Selesai Ditindaklanjuti' }
            : c
        )
      );
      if (triggerRefund) {
        setAdminTransactions((prev) =>
          prev.map((t) =>
            t.orderCode === targetDispute.orderCode
              ? {
                  ...t,
                  gatewayStatus: 'Refunded',
                  adminActionNote: `Refund otomatis dari penyelesaian sengketa #${targetDispute.ticketCode}.`,
                }
              : t
          )
        );
      }
      if (takedownItemName) {
        const matchedItem = catalogItems.find(
          (i) => i.title.toLowerCase() === takedownItemName.toLowerCase()
        );
        if (matchedItem) {
          handleUpdateProductMonitoring(
            matchedItem.id,
            'Take Down',
            `Di-take down otomatis melalui putusan sengketa #${targetDispute.ticketCode}`
          );
        }
      }
    }
  };

  const handleUpdateTransactionGateway = (
    trxId: string,
    nextStatus: AdminTransactionRecord['gatewayStatus'],
    note: string
  ) => {
    setAdminTransactions((prev) =>
      prev.map((t) =>
        t.id === trxId
          ? { ...t, gatewayStatus: nextStatus, adminActionNote: note }
          : t
      )
    );
  };

  const handleUpdateUserAccess = (
    userId: string,
    nextRole: UserRole,
    nextStatus: AccountStatus,
    sanctionNote?: string
  ) => {
    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: nextRole,
              status: nextStatus,
              sanctionNote:
                nextStatus === 'Aktif' ? undefined : sanctionNote || u.sanctionNote,
              violationCount:
                nextStatus !== 'Aktif' ? u.violationCount + 1 : u.violationCount,
            }
          : u
      )
    );
  };

  const handleAddUserAccount = (newUser: UserAccessRecord) => {
    setUserAccounts((prev) => [newUser, ...prev]);
  };

  // Public Marketplace Catalog excludes products that Admin has Taken Down
  const publicVisibleCatalogItems = useMemo(
    () =>
      catalogItems.filter(
        (item) => productMonitoring[item.id]?.monitoringStatus !== 'Take Down'
      ),
    [catalogItems, productMonitoring]
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === 'siap-diambil'),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter((o) => o.status === 'selesai'),
    [orders]
  );

  return (
    <div
      className={`${
        activePage === 'chat' || activePage === 'chat-bot'
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-screen overflow-x-hidden'
      } flex flex-col bg-white text-stone-900 ${
        activePage !== 'landing' && activePage !== 'auth' && activePage !== 'admin' && activePage !== 'chat' && activePage !== 'chat-bot'
          ? 'pb-16'
          : ''
      }`}
    >
      {/* Top Navigation Bar — Hidden on Login/Register Page & Admin Workspace */}
      {activePage !== 'auth' && activePage !== 'admin' && (
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#1F281A] text-white border-b border-white/10 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4 md:gap-8 px-3 sm:px-6">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={openLandingPage}
            className="text-lg md:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 cursor-pointer"
          >
            SisaPiring
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-display font-medium text-stone-100"
          >
            {activePage === 'landing' ? (
              /* ON LANDING PAGE: Only Beranda, Cara Kerja, Dampak UMKM */
              <>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('beranda');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else openLandingPage();
                  }}
                  className="text-[#8da249] font-bold underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Beranda
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('cara-kerja')}
                  className="hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Cara Kerja
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('dampak-umkm')}
                  className="hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Fakta Limbah Pangan
                </button>
              </>
            ) : (
              /* INSIDE APP: Etalase Makanan, Pesanan, Chat Penjual, History, Beranda, Mitra UMKM, Panel Admin */
              <>
                <button
                  type="button"
                  onClick={openEtalasePage}
                  className={`hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activePage === 'etalase' ? 'text-[#8da249] font-bold underline' : ''
                  }`}
                >
                  Etalase Makanan
                </button>
                <button
                  type="button"
                  onClick={openOrdersPage}
                  className={`hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activePage === 'pesanan' ? 'text-[#8da249] font-bold underline' : ''
                  }`}
                >
                  Pesanan
                </button>
                <button
                  type="button"
                  onClick={() => openChatPage()}
                  className={`hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activePage === 'chat' || activePage === 'chat-bot' ? 'text-[#8da249] font-bold underline' : ''
                  }`}
                >
                  Chat Penjual
                </button>
                <button
                  type="button"
                  onClick={openHistoryPage}
                  className={`hover:text-[#8da249] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activePage === 'history' ? 'text-[#8da249] font-bold underline' : ''
                  }`}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={openLandingPage}
                  className="hover:text-[#8da249] hover:underline underline-offset-4 text-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Beranda
                </button>
                <button
                  type="button"
                  onClick={() => openSellerPage()}
                  className="hover:text-[#8da249] hover:underline underline-offset-4 text-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Mitra UMKM
                </button>
                <button
                  type="button"
                  onClick={openAdminPage}
                  className="hover:text-[#8da249] hover:underline underline-offset-4 text-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Panel Admin
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {activePage === 'landing' ? (
              /* ON LANDING PAGE: CTA button to enter app + Login/User + Hamburger */
              <button
                type="button"
                onClick={openEtalasePage}
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 bg-[#8DA249] hover:bg-[#7b8e3d] text-white shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Mulai Pakai</span>
              </button>
            ) : (
              /* INSIDE APP: Chat + Cart + Login/User + Hamburger */
              <>
                <button
                  type="button"
                  onClick={() => openChatPage()}
                  title="Pusat Pesan & Chat Penjual"
                  aria-label="Pusat Pesan & Chat Penjual"
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center text-white border rounded-xl transition-colors shrink-0 cursor-pointer ${
                    activePage === 'chat'
                      ? 'bg-white/30 border-[#8da249]'
                      : 'bg-white/15 border-white/25 hover:bg-white/25'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#8da249]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f89254] ring-2 ring-[#1F281A]" />
                </button>

                <button
                  type="button"
                  onClick={openCartPage}
                  aria-label={`Kantong Belanja (${totalCartItems} item)`}
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center text-white border rounded-xl transition-colors shrink-0 cursor-pointer ${
                    activePage === 'kantong'
                      ? 'bg-white/30 border-[#8da249]'
                      : 'bg-white/15 border-white/25 hover:bg-white/25'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#8da249]" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f89254] text-white text-[10px] font-bold font-mono-tabular flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              </>
            )}

            {!currentUser ? (
              <button
                type="button"
                onClick={openAuthPage}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border bg-white text-[#1F281A] border-white hover:bg-stone-100 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-label="Menu Akun Pengguna"
                  aria-expanded={isAccountMenuOpen}
                  className={`w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center text-white border rounded-xl transition-colors shrink-0 cursor-pointer ${
                    isAccountMenuOpen
                      ? 'bg-white/30 border-[#8da249]'
                      : 'bg-white/15 border-white/25 hover:bg-white/25'
                  }`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#8da249]" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-stone-900 border border-stone-200 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-stone-100 bg-white">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-stone-500 mt-0.5">
                        {currentUser.phone}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditDistrictText(currentUser.district || 'Coblong (Dago / Dipatiukur)');
                          setEditAddressText(currentUser.defaultAddress || '');
                          setAccountModalMode('address');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#1F281A] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="block font-semibold text-stone-900">
                            Alamat Default
                          </span>
                          <span className="block text-[11px] text-stone-500 truncate">
                            {currentUser.defaultAddress || 'Belum diatur'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditNameText(currentUser.name);
                          setEditPhoneText(currentUser.phone);
                          setAccountModalMode('profile');
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#1F281A] shrink-0" />
                        <span>Pengaturan Profil & Nomor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openCartPage();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#1F281A] shrink-0" />
                        <span>Kantong Penyelamatan ({totalCartItems})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setActiveTab('dashboard');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-[#1F281A] shrink-0" />
                        <span>Portal Mitra UMKM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openAdminPage();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#1F281A] shrink-0" />
                        <span>Panel Admin (Pengelola)</span>
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUser(null);
                          setIsAccountMenuOpen(false);
                          if (activePage === 'pesanan' || activePage === 'history') {
                            setActivePage('etalase');
                          }
                          setRecentToast('Anda telah keluar dari akun.');
                          window.setTimeout(() => setRecentToast(null), 2500);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Navigation Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Buka Menu Navigasi"
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center text-white border border-white/20 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Mobile Navigation Drawer for Customer & Portal Links */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white text-stone-900 shadow-2xl p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-stone-100">
                <span className="font-display font-bold text-xl text-[#1F281A]">
                  SisaPiring
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {activePage === 'landing' ? (
                  /* ON LANDING PAGE: Beranda, Cara Kerja, Dampak UMKM + Mulai Pakai CTA */
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        const el = document.getElementById('beranda');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        else openLandingPage();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#8da249]/15 text-[#8da249] transition-colors cursor-pointer"
                    >
                      Beranda
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        navigateToSection('cara-kerja');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Cara Kerja
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        navigateToSection('dampak-umkm');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Fakta Limbah Pangan
                    </button>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileNavOpen(false);
                          openEtalasePage();
                        }}
                        className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-[#8DA249] hover:bg-[#7b8e3d] text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Mulai Pakai (Buka Etalase)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* INSIDE APP: Etalase Makanan, Pesanan, Chat Penjual, History, Beranda */
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        openEtalasePage();
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        activePage === 'etalase'
                          ? 'bg-[#8da249]/15 text-[#8da249]'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Etalase Makanan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        openOrdersPage();
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        activePage === 'pesanan'
                          ? 'bg-[#8da249]/15 text-[#8da249]'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Pesanan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        openChatPage();
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        activePage === 'chat' || activePage === 'chat-bot'
                          ? 'bg-[#8da249]/15 text-[#8da249]'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Chat Penjual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        openHistoryPage();
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        activePage === 'history'
                          ? 'bg-[#8da249]/15 text-[#8da249]'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      History Pesanan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        openLandingPage();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Beranda (Landing)
                    </button>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-2">
                <p className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Portal Khusus
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    openSellerPage();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#8da249] bg-[#8da249]/10 hover:bg-[#8da249]/20 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Portal Mitra UMKM</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    openAdminPage();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#2e434f] bg-stone-100 hover:bg-stone-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Panel Admin</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    openAuthPage();
                  }}
                  className="w-full h-11 bg-[#1F281A] hover:bg-[#2e434f] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Daftar Akun</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      setCurrentUser(null);
                    }}
                    className="w-full h-9 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Non-intrusive Feedback Toast */}
      {recentToast && (
        <div className="fixed top-16 inset-x-4 sm:inset-x-auto sm:right-5 z-40 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-lg border border-stone-700 flex items-center justify-between sm:justify-start gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{recentToast}</span>
          </div>
          <button
            type="button"
            onClick={openCartPage}
            className="underline font-semibold text-emerald-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Lihat
          </button>
        </div>
      )}

      {activePage === 'admin' ? (
        /* PAGE 8: DEDICATED PLATFORM ADMIN GOVERNANCE CONSOLE */
        <main className="flex-1">
          <AdminDashboardPage
            catalogItems={catalogItems}
            productMonitoring={productMonitoring}
            umkmVerifications={umkmVerifications}
            disputes={adminDisputes}
            transactions={adminTransactions}
            discountHistory={discountHistory}
            userAccounts={userAccounts}
            orders={orders}
            complaints={complaints}
            onUpdateUmkmStatus={handleUpdateUmkmStatus}
            onAddSimulatedUmkm={handleAddSimulatedUmkm}
            onUpdateProductMonitoring={handleUpdateProductMonitoring}
            onCorrectProductPrice={handleCorrectProductPrice}
            onResolveDispute={handleResolveDispute}
            onUpdateTransactionGateway={handleUpdateTransactionGateway}
            onUpdateUserAccess={handleUpdateUserAccess}
            onAddUserAccount={handleAddUserAccount}
            onSwitchToPublicEtalase={openEtalasePage}
            onSwitchToSellerPortal={() => setActiveTab('dashboard')}
            onOpenPublicStore={openStorePage}
          />
        </main>
      ) : activePage === 'auth' ? (
        /* PAGE 4: SEPARATE LOGIN & REGISTER PAGE */
        <main className="flex-1">
          <AuthPage
            onSuccessLogin={handleSuccessLogin}
            onBack={() => setActivePage(returnPageAfterAuth)}
          />
        </main>
      ) : activePage === 'kantong' ? (
        /* PAGE 3: SEPARATE DEDICATED CART PAGE */
        <main className="flex-1">
          <RescueCartPage
            cart={cart}
            currentUser={currentUser}
            onUpdateQty={handleUpdateCartQty}
            onRemove={handleRemoveFromCart}
            onClearCart={() => setCart([])}
            onBackToEtalase={openEtalasePage}
            onNavigateToAuth={openAuthPage}
            onOrderCreated={handleOrderCreated}
            onGoToPesanan={() => {
              setActivePage('pesanan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : activePage === 'store' ? (
        /* PAGE 7: DEDICATED STORE CATALOG & REVIEWS PAGE */
        <main className="flex-1">
          <StoreCatalogPage
            merchantName={selectedStoreName}
            allItems={publicVisibleCatalogItems}
            cart={cart}
            currentUser={currentUser}
            reviews={storeReviews}
            complaints={complaints}
            onBack={openEtalasePage}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onOpenDetail={(item) => setActiveProductModal(item)}
            onAddReview={handleAddStoreReview}
            onAddComplaint={handleAddComplaint}
            onChatStore={(mName) => openChatPage(mName)}
          />
        </main>
      ) : activePage === 'chat' ? (
        /* PAGE 8: DEDICATED CHAT VIEW (CHAT DENGAN PENJUAL MITRA UMKM) */
        <main className="flex-1 min-h-0 w-full overflow-hidden bg-white mb-16">
          <ChatContainerPage
            initialMerchantName={chatTargetMerchant}
            catalog={publicVisibleCatalogItems}
            onBack={openEtalasePage}
            onOpenStore={(mName) => openStorePage(mName)}
            onOpenOrder={(orderCode) => openOrdersPage()}
            onOpenEtalase={openEtalasePage}
            onSelectProduct={(item) => setActiveProductModal(item)}
          />
        </main>
      ) : activePage === 'chat-bot' ? (
        /* PAGE 9: DEDICATED AI CHAT BOT VIEW */
        <main className="flex-1 min-h-0 w-full overflow-hidden bg-white mb-16">
          <BotChatView
            catalog={publicVisibleCatalogItems}
            onBack={openEtalasePage}
            onOpenEtalase={openEtalasePage}
            onOpenOrders={openOrdersPage}
            onOpenSellerChat={(merchantName) => openChatPage(merchantName)}
            onSelectProduct={(item) => setActiveProductModal(item)}
          />
        </main>
      ) : activePage === 'pesanan' ? (
        /* PAGE 5: DEDICATED PESANAN AKTIF & TRACKING PENGIRIMAN PAGE */
        <main className="flex-1 bg-white pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Belum Ada Pesanan Aktif
                </h2>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Pesanan yang baru selesai dibayar akan tampil di sini lengkap dengan status pengiriman mulai dari Diterima, Diambil, Perjalanan, hingga Sampai.
                </p>
                <button
                  type="button"
                  onClick={openEtalasePage}
                  className="min-h-[42px] px-5 py-2 bg-[#1F281A] text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  Cari Makanan di Menu Utama
                </button>
              </div>
            ) : (
              activeOrders.map((order) => {
                const stageOrder: OrderRecord['deliveryStage'][] = [
                  'diterima',
                  'diambil',
                  'perjalanan',
                  'sampai',
                ];
                const currentStageIdx = Math.max(
                  0,
                  stageOrder.indexOf(order.deliveryStage || 'diterima')
                );
                const currentStageInfo =
                  DELIVERY_STAGES[currentStageIdx] || DELIVERY_STAGES[0];
                const progressPercent =
                  (currentStageIdx / (DELIVERY_STAGES.length - 1)) * 100;

                return (
                  <div
                    key={order.orderCode}
                    className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/10 text-[#1F281A] text-[11px] font-semibold">
                            Status: {currentStageInfo.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Dipesan {order.createdAt} ·{' '}
                          {order.payment === 'qris'
                            ? 'Pembayaran QRIS (Lunas)'
                            : 'Bayar di Tempat (COD)'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="block text-[11px] text-stone-400">
                          Kode Pesanan
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono-tabular text-[#1F281A]">
                          {order.orderCode}
                        </span>
                      </div>
                    </div>

                    {/* READ-ONLY LEFT-TO-RIGHT SLIDER TRACK WITH MOVING PACKAGE ICON (CONTROLLED BY STORE OWNER) */}
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#1F281A]" />
                          <span>Status Pengiriman Pesanan</span>
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Diperbarui oleh pemilik toko UMKM
                        </span>
                      </div>

                      {/* Horizontal Slider Bar with Moving Package Icon */}
                      <div className="pt-3 pb-1 px-4 sm:px-6">
                        <div className="relative h-2.5 bg-stone-200 rounded-full">
                          {/* Filled Active Track from Left to Right */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#1F281A] rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />

                          {/* 4 Milestone Dots on the Track */}
                          {DELIVERY_STAGES.map((stage, idx) => {
                            const dotPercent =
                              (idx / (DELIVERY_STAGES.length - 1)) * 100;
                            const isPassed = idx <= currentStageIdx;
                            return (
                              <div
                                key={stage.key}
                                style={{ left: `${dotPercent}%` }}
                                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors duration-500 ${
                                  isPassed
                                    ? 'bg-[#1F281A] border-white'
                                    : 'bg-stone-300 border-white'
                                }`}
                              />
                            );
                          })}

                          {/* Moving Package Icon Indicator on the Slider */}
                          <div
                            style={{ left: `${progressPercent}%` }}
                            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1F281A] text-white border-2 border-white shadow-md ring-4 ring-[#1F281A]/15 flex items-center justify-center transition-all duration-700 ease-out z-10 pointer-events-none select-none"
                            aria-label={`Posisi paket: ${currentStageInfo.label}`}
                          >
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                          </div>
                        </div>

                        {/* 4 Stage Labels Under the Slider (Read-Only) */}
                        <div className="grid grid-cols-4 gap-1 mt-4 text-center select-none">
                          {DELIVERY_STAGES.map((stage, idx) => {
                            const isCurrent = idx === currentStageIdx;
                            const isPassed = idx <= currentStageIdx;
                            return (
                              <div key={stage.key} className="space-y-0.5">
                                <span
                                  className={`block text-[11px] sm:text-xs leading-tight ${
                                    isCurrent
                                      ? 'font-bold text-[#1F281A]'
                                      : isPassed
                                      ? 'font-semibold text-stone-800'
                                      : 'font-medium text-stone-400'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <p className="text-stone-700 font-medium">
                          {currentStageInfo.desc}
                        </p>
                        {currentUser?.defaultAddress && (
                          <span className="text-[11px] text-stone-500 shrink-0 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#1F281A]" />
                            <span className="truncate max-w-[220px]">
                              Tujuan: {currentUser.defaultAddress}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ordered Food Items */}
                    <div className="space-y-2.5">
                      {order.items.map(({ item, quantity }) => (
                        <div
                          key={item.id}
                          className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200/70"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                            <ResilientImage
                              src={item.imageUrl}
                              alt={item.title}
                              fallbackTitle={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                            <p className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                              {quantity}x {item.title}
                            </p>
                            <div>
                              <button
                                type="button"
                                onClick={() => openStorePage(item.merchantName)}
                                className="max-w-full text-xs text-[#1F281A] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer overflow-hidden"
                              >
                                <Store className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.merchantName}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">
                              {item.address}
                            </p>
                          </div>
                          <div className="text-right shrink-0 pl-2 self-center">
                            <span className="inline-block text-xs sm:text-sm font-bold text-[#1F281A] font-mono-tabular whitespace-nowrap">
                              {formatRupiah(item.rescuePrice * quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Summary (Read-Only Status Note) */}
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-stone-600">
                        <span>Total Bayar: </span>
                        <strong className="text-sm text-[#1F281A] font-mono-tabular">
                          {formatRupiah(order.totalPaid)}
                        </strong>
                        <span className="text-emerald-900 font-medium ml-2">
                          (Hemat {formatRupiah(order.totalSaved)})
                        </span>
                      </div>

                      <span className="text-[11px] text-stone-500">
                        Menunggu pembaruan status dari kasir toko UMKM
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      ) : activePage === 'history' ? (
        /* PAGE 6: DEDICATED HISTORY PESANAN, RATING UMKM & LAPORAN KOMPLAIN PAGE */
        <main className="flex-1 bg-white pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-4">
            {/* Summary Savings Banner */}
            <div className="bg-[#1F281A] text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-xs text-emerald-200">
                  Total Penghematan Anda di SisaPiring
                </p>
                <p className="text-lg sm:text-2xl font-bold font-mono-tabular mt-0.5">
                  {formatRupiah(
                    historyOrders.reduce((acc, o) => acc + o.totalSaved, 0)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] sm:text-xs text-emerald-200">
                  Porsi Terselamatkan
                </p>
                <p className="text-lg sm:text-2xl font-bold font-mono-tabular mt-0.5">
                  {historyOrders.reduce(
                    (acc, o) =>
                      acc + o.items.reduce((s, i) => s + i.quantity, 0),
                    0
                  )}{' '}
                  Paket
                </p>
              </div>
            </div>

            {historyOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <HistoryIcon className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Belum Ada Riwayat Pesanan
                </h2>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Pesanan yang sudah sampai dan selesai akan tercatat otomatis di sini untuk diberi rating atau laporan keamanan.
                </p>
              </div>
            ) : (
              historyOrders.map((order) => (
                <div
                  key={order.orderCode}
                  className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 font-mono-tabular">
                          #{order.orderCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/10 text-[#1F281A] text-[11px] font-semibold">
                          Sampai & Selesai
                        </span>
                        {order.userRating && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold inline-flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{order.userRating}.0</span>
                          </span>
                        )}
                        {order.hasComplaint && (
                          <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                            Laporan Dikirim
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {order.createdAt}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#1F281A] font-mono-tabular">
                      {formatRupiah(order.totalPaid)}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {order.items.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.title}
                            fallbackTitle={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                            {quantity}x {item.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => openStorePage(item.merchantName)}
                            className="max-w-full text-[11px] text-[#1F281A] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer overflow-hidden"
                          >
                            <Store className="w-3 h-3 shrink-0" />
                            <span className="truncate">Lihat Toko: {item.merchantName}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddToCart(item, 1);
                            openCartPage();
                          }}
                          className="h-8 px-3 rounded-lg border border-stone-300 hover:border-[#1F281A] text-xs font-semibold text-[#1F281A] inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          <RotateCcw className="w-3 h-3 shrink-0" />
                          <span>Pesan Lagi</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Post-Order Rating & Safety Report / Complaint Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalComplaintCat('Makanan Tidak Sesuai Deskripsi');
                        setModalComplaintDesc('');
                        setModalComplaintFile('');
                        setOrderComplaintModal(order);
                      }}
                      className="h-9 px-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Ajukan Laporan / Komplain</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalRatingValue(order.userRating || 5);
                        setModalReviewText('');
                        setOrderReviewModal(order);
                      }}
                      className="h-9 px-3.5 rounded-xl bg-[#1F281A] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>
                        {order.userRating ? 'Ubah Rating & Ulasan' : 'Beri Rating UMKM'}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      ) : activePage === 'etalase' ? (
        /* PAGE 2: SEPARATE DEDICATED PRODUCT DISPLAY PAGE */
        <main className="flex-1">
          <MarketplaceDisplayPage
            items={publicVisibleCatalogItems}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onOpenDetail={(item) => setActiveProductModal(item)}
            onOpenCart={openCartPage}
          />
          <Footer
            extraPaddingBottom={true}
            onNavigateHome={openLandingPage}
            onNavigateSection={(sec) => {
              openLandingPage();
              window.setTimeout(() => navigateToSection(sec), 150);
            }}
            onNavigateEtalase={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onNavigateOrders={openOrdersPage}
            onNavigateChat={openChatPage}
          />
        </main>
      ) : (
        /* PAGE 1: DEDICATED LANDING PAGE */
        <main id="beranda" className="flex-1">
          {/* SECTION 1: FULL-SCREEN HERO SECTION WITH DOMINANT HEADLINE */}
          <section className="relative w-full min-h-[78vh] md:min-h-[calc(100vh-64px)] flex items-end md:items-center overflow-hidden bg-stone-950">
            {/* Full-Bleed Background Image */}
            <div className="absolute inset-0 z-0">
              <ResilientImage
                src={HERO_IMAGE_PATH}
                alt="Suasana sore di Warung Roti Senja saat menyiapkan kantong penyelamatan makanan UMKM"
                fallbackTitle="SisaPiring — Penyelamatan Kuliner UMKM"
                className="w-full h-full object-cover object-center"
              />
              {/* Measured Contrast Scrims for Mobile & Desktop Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30 md:bg-gradient-to-r md:from-black/35 md:via-black/45 md:to-black/75" />
            </div>

            {/* Dominant Typography Content */}
            <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 md:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-start-7 lg:col-span-6 space-y-4 sm:space-y-6 text-white">
                  <h1
                    className="font-display font-bold tracking-tight text-white leading-[1.05] drop-shadow-xs"
                    style={{
                      fontSize: 'clamp(2.35rem, 7.5vw, 5.1rem)',
                    }}
                  >
                    <span className="block">Hidangan Segar.</span>
                    <span className="block">Kualitas UMKM.</span>
                    <span className="block">Hemat 60%.</span>
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-stone-100 leading-relaxed max-w-[46ch] font-normal">
                    Terinspirasi dari semangat menghargai setiap piring masakan lokal, SisaPiring menghadirkan hidangan berlebih layak santap dari toko roti, kafe, dan warung UMKM dengan harga bersahabat setiap sore.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={openEtalasePage}
                      className="w-full sm:w-auto min-h-[48px] px-10 py-3.5 bg-[#8DA249] hover:bg-[#7b8e3d] active:scale-[0.99] text-white font-display font-semibold text-base rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-[#8DA249]/30"
                    >
                      Mulai Pakai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Full-Width 4-Column Quantitative Proof Strip Below Hero */}
          <section
            aria-label="Fakta Krisis Sampah Pangan di Indonesia"
            className="bg-[#F4F6EC] border-b border-[#8DA249]/20 py-8 sm:py-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#8DA249]/15">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f89254]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Fakta Krisis Sampah Pangan di Indonesia
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  Sumber: Kajian Food Loss & Waste Bappenas & Data SIPSN KLHK
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1F281A] font-mono-tabular">
                    23 – 48 Juta Ton
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Bahan pangan terbuang per tahun di Indonesia (115–184 kg/kapita/tahun · Bappenas)
                  </p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8DA249] font-mono-tabular">
                    Rp 551 Triliun
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Kerugian ekonomi per tahun akibat makanan terbuang, setara 4%–5% PDB nasional (Bappenas)
                  </p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1F281A] font-mono-tabular">
                    41,5% Sampah RI
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Komposisi sisa makanan mendominasi timbulan sampah terbesar di TPA se-Indonesia (SIPSN KLHK 2023)
                  </p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1F281A] font-mono-tabular">
                    125 Juta Jiwa
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Porsi pangan terbuang yang sebenarnya mampu mencukupi makan 29%–47% populasi warga (Bappenas)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: MECHANISM ("CARA KERJA") */}
          <section
            id="cara-kerja"
            className="py-12 sm:py-16 md:py-24 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center space-y-3 mb-10 sm:mb-14">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8DA249]">
                  Mekanisme Transparan · Menguntungkan Warga & UMKM
                </p>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight font-display"
                  style={{ textWrap: 'balance' }}
                >
                  Cara Menyelamatkan Makanan Tanpa Ribet
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
                  Makanan yang dijual di SisaPiring bukanlah makanan bekas, melainkan stok produksi baru hari ini yang melebihi kuota penjualan harian UMKM dengan potongan harga hemat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
                {/* Langkah 01 */}
                <div className="p-4.5 sm:p-6 rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/25 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#8DA249]/50 transition-colors">
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8DA249] text-white font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-xs shrink-0">
                        01
                      </span>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        Pilih Menu Spesifik di Sekitar Anda
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Setiap pukul 15.00–17.00 WIB, mitra toko roti, kafe, dan rumah makan memperbarui jumlah porsi berlebih mereka dengan potongan harga minimal 50%.
                    </p>
                  </div>

                  <div className="mt-2 rounded-xl overflow-hidden border border-stone-200/90 bg-white shadow-2xs group">
                    <div className="h-36 xs:h-40 sm:h-48 md:h-44 lg:h-48 w-full overflow-hidden bg-stone-100 flex items-center justify-center">
                      <ResilientImage
                        src="/assets/steps/step1-pilih-menu.png"
                        alt="Tangkapan layar katalog menu etalase di aplikasi SisaPiring"
                        fallbackTitle="Katalog Menu Etalase"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Tampilan Menu Aplikasi</span>
                      <span className="text-[#8DA249] font-medium">Etalase Makanan</span>
                    </div>
                  </div>
                </div>

                {/* Langkah 02 */}
                <div className="p-4.5 sm:p-6 rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/25 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#8DA249]/50 transition-colors">
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8DA249] text-white font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-xs shrink-0">
                        02
                      </span>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        Kunci Pesanan & Dapatkan Kode Tiket
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Pesan langsung dari halaman etalase dan bayar menggunakan QRIS instan bebas biaya admin atau bayar tunai saat mengambil di kasir mitra UMKM.
                    </p>
                  </div>

                  <div className="mt-2 rounded-xl overflow-hidden border border-stone-200/90 bg-white shadow-2xs group">
                    <div className="h-36 xs:h-40 sm:h-48 md:h-44 lg:h-48 w-full overflow-hidden bg-stone-100 flex items-center justify-center">
                      <ResilientImage
                        src="/assets/steps/step2-kunci-pesanan.png"
                        alt="Tangkapan layar kode pesanan dan pembayaran QRIS di aplikasi SisaPiring"
                        fallbackTitle="Kode Tiket Pesanan"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Kode Tiket & QRIS</span>
                      <span className="text-[#8DA249] font-medium">Lunas Instan</span>
                    </div>
                  </div>
                </div>

                {/* Langkah 03 */}
                <div className="p-4.5 sm:p-6 rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/25 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#8DA249]/50 transition-colors">
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8DA249] text-white font-mono font-bold text-sm sm:text-base flex items-center justify-center shadow-xs shrink-0">
                        03
                      </span>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        Jemput Hidangan pada Jam Penyelamatan
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Datang ke lokasi UMKM sesuai jadwal ambil (misal 18.30–20.30 WIB), tunjukkan kode tiket pesanan SisaPiring, dan nikmati santapan berkualitas.
                    </p>
                  </div>

                  <div className="mt-2 rounded-xl overflow-hidden border border-stone-200/90 bg-white shadow-2xs group">
                    <div className="h-36 xs:h-40 sm:h-48 md:h-44 lg:h-48 w-full overflow-hidden bg-stone-100 flex items-center justify-center">
                      <ResilientImage
                        src="/assets/steps/step3-jemput-hidangan.png"
                        alt="Tangkapan layar status pengiriman dan penjemputan pesanan di aplikasi SisaPiring"
                        fallbackTitle="Pelacakan Pesanan"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Pelacakan Real-Time</span>
                      <span className="text-[#8DA249] font-medium">Status Ambil / Antar</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-12 text-center">
                <button
                  type="button"
                  onClick={openEtalasePage}
                  className="min-h-[46px] px-8 py-3 bg-[#1F281A] hover:bg-[#2e434f] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#8DA249]" />
                  <span>Jelajahi Etalase Kuliner Sekarang</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: PROOF OF IMPACT, ATTRIBUTABLE UMKM STORIES & PARTNER FORM */}
          <section
            id="dampak-umkm"
            className="border-t border-[#8DA249]/20 bg-[#F4F6EC] py-12 sm:py-16 md:py-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
              {/* MENU FUN FACT DARI DAMPAK PEMBUANGAN MAKANAN / LIMBAH PANGAN */}
              <FoodWasteFunFacts
                onOpenEtalase={openEtalasePage}
                onOpenPartnerForm={() => {
                  const el = document.getElementById('gabung-mitra');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Bottom Sub-Block: Interactive Partner / Community Lead Capture Form */}
              <div
                id="gabung-mitra"
                className="pt-10 sm:pt-12 border-t border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
              >
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <p className="text-xs text-stone-500">
                    Kemitraan Terbuka · Pendaftaran Tanpa Biaya Awal
                  </p>
                  <h2
                    className="text-2xl md:text-3xl font-semibold text-stone-900 tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Daftarkan Usaha Kuliner Anda atau Aktifkan Pengingat Sore
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Apakah Anda pemilik toko roti, warung makan, katering, atau kedai kopi yang sering memiliki stok berlebih di jam tutup? Bergabunglah bersama 340+ UMKM lainnya dan ubah sisa produksi harian menjadi pelanggan setia baru.
                  </p>
                  <div className="pt-1 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-900 shrink-0" />
                      <span>Terpusat di Kota Bandung (Dago, Braga, Riau, Buahbatu, Setiabudi & Lengkong)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-900 shrink-0" />
                      <span>Pencairan dana penjualan UMKM otomatis setiap pagi pukul 08.00 WIB</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-stone-200">
                      <div>
                        <h3 className="text-base font-semibold text-stone-900">
                          Formulir Kemitraan & Komunitas SisaPiring
                        </h3>
                        <p className="text-xs text-stone-500">
                          Pilih peran Anda untuk memulai
                        </p>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl self-start">
                        <button
                          type="button"
                          onClick={() => {
                            setRegistrationRole('mitra');
                            setLeadSubmitted(false);
                          }}
                          className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            registrationRole === 'mitra'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Pemilik UMKM
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRegistrationRole('warga');
                            setLeadSubmitted(false);
                          }}
                          className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            registrationRole === 'warga'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Warga / Pembeli
                        </button>
                      </div>
                    </div>

                    {leadSubmitted ? (
                      <div className="py-8 text-center space-y-3">
                        <CheckCircle2 className="w-10 h-10 text-emerald-900 mx-auto" />
                        <h4 className="text-base sm:text-lg font-semibold text-stone-900">
                          {registrationRole === 'mitra'
                            ? `Terima kasih, ${leadName}! Data UMKM "${leadBusinessOrArea}" telah kami terima.`
                            : `Terima kasih, ${leadName}! Notifikasi wilayah ${leadDistrict}, Bandung telah aktif.`}
                        </h4>
                        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                          {registrationRole === 'mitra'
                            ? `Tim kemitraan SisaPiring Bandung (${leadDistrict}) akan menghubungi Anda melalui ${leadContact} dalam 1x24 jam kerja untuk aktivasi etalase sore.`
                            : `Kami akan mengirimkan pemberitahuan ke ${leadContact} setiap pukul 16.30 WIB saat UMKM di sekitar ${leadDistrict} membuka paket hemat.`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setLeadSubmitted(false);
                            setLeadName('');
                            setLeadBusinessOrArea('');
                            setLeadContact('');
                          }}
                          className="mt-2 min-h-[42px] px-4 py-2 text-xs font-medium text-stone-700 border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          Kirim Pendaftaran Lainnya
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePartnerSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="lead-name"
                              className="block text-xs font-medium text-stone-700 mb-1"
                            >
                              Nama Lengkap Anda
                            </label>
                            <input
                              id="lead-name"
                              type="text"
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              placeholder="Contoh: Ibu Rini Wulandari"
                              className="w-full h-11 px-3.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="lead-business"
                              className="block text-xs font-medium text-stone-700 mb-1"
                            >
                              {registrationRole === 'mitra'
                                ? 'Nama Toko Roti / Warung / Kafe UMKM'
                                : 'Kecamatan Tempat Tinggal Anda'}
                            </label>
                            <input
                              id="lead-business"
                              type="text"
                              value={leadBusinessOrArea}
                              onChange={(e) => setLeadBusinessOrArea(e.target.value)}
                              placeholder={
                                registrationRole === 'mitra'
                                  ? 'Contoh: Roti Bakar Klasik Dipatiukur'
                                  : 'Contoh: Kecamatan Tebet / Coblong'
                              }
                              className="w-full h-11 px-3.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor="lead-city"
                              className="block text-xs font-medium text-stone-700 mb-1"
                            >
                              Kawasan Bandung
                            </label>
                            <select
                              id="lead-city"
                              value={leadDistrict}
                              onChange={(e) => setLeadDistrict(e.target.value)}
                              className="w-full h-11 px-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 cursor-pointer"
                            >
                              <option value="Coblong (Dago / Dipatiukur)">Coblong (Dago / Dipatiukur)</option>
                              <option value="Sumur Bandung (Braga)">Sumur Bandung (Braga)</option>
                              <option value="Bandung Wetan (Riau / Citarum)">Bandung Wetan (Riau / Citarum)</option>
                              <option value="Lengkong (Burangrang)">Lengkong (Burangrang)</option>
                              <option value="Buahbatu">Buahbatu</option>
                              <option value="Sukasari (Setiabudi)">Sukasari (Setiabudi)</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="lead-contact"
                              className="block text-xs font-medium text-stone-700 mb-1"
                            >
                              Nomor WhatsApp / Email Aktif
                            </label>
                            <input
                              id="lead-contact"
                              type="text"
                              value={leadContact}
                              onChange={(e) => setLeadContact(e.target.value)}
                              placeholder="0812xxxxxxxx"
                              className="w-full h-11 px-3.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 font-mono-tabular"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="lead-portions"
                              className="block text-xs font-medium text-stone-700 mb-1"
                            >
                              {registrationRole === 'mitra'
                                ? 'Estimasi Sisa Piring Harian'
                                : 'Preferensi Hidangan'}
                            </label>
                            <select
                              id="lead-portions"
                              value={leadPortions}
                              onChange={(e) => setLeadPortions(e.target.value)}
                              className="w-full h-11 px-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 cursor-pointer"
                            >
                              {registrationRole === 'mitra' ? (
                                <>
                                  <option value="5–15 porsi / hari">5–15 porsi / hari</option>
                                  <option value="16–30 porsi / hari">16–30 porsi / hari</option>
                                  <option value="> 30 porsi / hari">&gt; 30 porsi / hari</option>
                                </>
                              ) : (
                                <>
                                  <option value="Roti, Kue & Pastry">Roti, Kue & Pastry</option>
                                  <option value="Nasi & Lauk Rumahan">Nasi & Lauk Rumahan</option>
                                  <option value="Semua Kategori Hemat">Semua Kategori Hemat</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        {leadError && (
                          <p className="text-xs text-red-700 font-medium">{leadError}</p>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-[11px] text-stone-500">
                            Data Anda dijaga kerahasiaannya dan hanya digunakan untuk koordinasi SisaPiring.
                          </p>
                          <button
                            type="submit"
                            className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-emerald-900 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {registrationRole === 'mitra'
                              ? 'Daftarkan Mitra UMKM Sekarang'
                              : 'Aktifkan Pengingat Hidangan Sore'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: DEDICATED CENTER-ALIGNED WEBSITE FOOTER */}
          <Footer
            extraPaddingBottom={false}
            onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onNavigateSection={(sec) => navigateToSection(sec)}
            onNavigateEtalase={openEtalasePage}
            onNavigateOrders={openOrdersPage}
            onNavigateChat={openChatPage}
          />
        </main>
      )}

      {/* CONTIGUOUS PURCHASE MODULE MODAL (PDP) */}
      <ProductDetailModal
        item={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
        onOpenStore={openStorePage}
        onChatStore={(mName) => openChatPage(mName)}
      />

      {/* MODAL BERI RATING & ULASAN UMKM SETELAH PESANAN SELESAI */}
      {orderReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Beri Rating & Ulasan UMKM
                </h3>
                <p className="text-xs text-stone-500">
                  Pesanan #{orderReviewModal.orderCode} ·{' '}
                  {orderReviewModal.items[0]?.item.merchantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderReviewModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const firstItem = orderReviewModal.items[0]?.item;
                if (firstItem) {
                  handleAddStoreReview({
                    merchantName: firstItem.merchantName,
                    reviewerName: currentUser?.name || orderReviewModal.name,
                    rating: modalRatingValue,
                    itemName: firstItem.title,
                    comment:
                      modalReviewText.trim() ||
                      'Hidangan sangat segar, sesuai deskripsi, dan pelayanan UMKM ramah.',
                    tags: modalReviewTags,
                  });
                }
                setOrders((prev) =>
                  prev.map((o) =>
                    o.orderCode === orderReviewModal.orderCode
                      ? { ...o, userRating: modalRatingValue }
                      : o
                  )
                );
                setOrderReviewModal(null);
                setRecentToast('Terima kasih atas rating & ulasan Anda!');
                window.setTimeout(() => setRecentToast(null), 2800);
              }}
              className="space-y-4"
            >
              <div>
                <span className="block text-xs font-medium text-stone-700 mb-1.5">
                  Penilaian Kualitas & Pelayanan UMKM
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setModalRatingValue(star)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= modalRatingValue
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-800 ml-1">
                    {modalRatingValue} / 5
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-stone-700 mb-1.5">
                  Kesan Hidangan
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Sesuai Deskripsi',
                    'Masih Hangat & Segar',
                    'Porsi Melimpah',
                    'Kemasan Rapi & Higienis',
                    'Pelayanan Ramah',
                  ].map((tag) => {
                    const active = modalReviewTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setModalReviewTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer ${
                          active
                            ? 'bg-[#1F281A] text-white border-[#1F281A]'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Tulis Ulasan untuk Toko UMKM
                </label>
                <textarea
                  rows={3}
                  value={modalReviewText}
                  onChange={(e) => setModalReviewText(e.target.value)}
                  placeholder="Bagikan pengalaman Anda mengenai rasa dan kesesuaian deskripsi makanan..."
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOrderReviewModal(null)}
                  className="h-10 px-4 text-xs font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
                >
                  Nanti Saja
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 text-xs font-semibold text-white bg-[#1F281A] hover:bg-emerald-900 rounded-xl cursor-pointer"
                >
                  Simpan Rating & Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LAPORAN & KOMPLAIN KEAMANAN PANGAN (REPORT & COMPLAINT) */}
      {orderComplaintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-red-100">
              <div className="flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="text-base font-bold font-display">
                    Ajukan Laporan / Komplain
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pesanan #{orderComplaintModal.orderCode} ·{' '}
                    {orderComplaintModal.items[0]?.item.merchantName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderComplaintModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!modalComplaintDesc.trim()) return;
                const firstItem = orderComplaintModal.items[0]?.item;
                if (firstItem) {
                  handleAddComplaint({
                    orderCode: orderComplaintModal.orderCode,
                    merchantName: firstItem.merchantName,
                    itemName: firstItem.title,
                    reporterName: currentUser?.name || orderComplaintModal.name,
                    category: modalComplaintCat,
                    description: modalComplaintDesc.trim(),
                    evidenceFileName: modalComplaintFile || undefined,
                  });
                }
                setOrders((prev) =>
                  prev.map((o) =>
                    o.orderCode === orderComplaintModal.orderCode
                      ? { ...o, hasComplaint: true }
                      : o
                  )
                );
                setOrderComplaintModal(null);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Jenis Kendala / Ketidaksesuaian
                </label>
                <select
                  value={modalComplaintCat}
                  onChange={(e) =>
                    setModalComplaintCat(
                      e.target.value as ComplaintReport['category']
                    )
                  }
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-red-600 cursor-pointer"
                >
                  <option value="Makanan Tidak Sesuai Deskripsi">
                    Makanan Tidak Sesuai Deskripsi
                  </option>
                  <option value="Kualitas / Kesegaran Kurang Baik">
                    Kualitas / Kesegaran Kurang Baik
                  </option>
                  <option value="Porsi Tidak Sesuai Ketentuan">
                    Porsi Tidak Sesuai Ketentuan
                  </option>
                  <option value="Kendala Saat Pengambilan di Toko">
                    Kendala Saat Pengambilan di Toko
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Jelaskan Kendala yang Anda Alami
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalComplaintDesc}
                  onChange={(e) => setModalComplaintDesc(e.target.value)}
                  placeholder="Contoh: Isi paket berbeda dengan deskripsi menu atau kemasan terbuka saat diterima..."
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between gap-2 border border-dashed border-stone-300 hover:border-red-500 bg-white rounded-xl px-3.5 py-2.5 cursor-pointer">
                  <span className="text-xs text-stone-600 truncate">
                    {modalComplaintFile
                      ? `Bukti foto: ${modalComplaintFile}`
                      : 'Lampirkan Foto Bukti Makanan (Opsional)'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-[11px] font-semibold text-stone-700 inline-flex items-center gap-1 shrink-0">
                    <Upload className="w-3 h-3" />
                    <span>Unggah</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setModalComplaintFile(f.name);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderComplaintModal(null)}
                  className="h-10 px-4 text-xs font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN ALAMAT DEFAULT / PROFIL DARI MENU ICON AKUN */}
      {accountModalMode && currentUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {accountModalMode === 'address'
                  ? 'Ubah Alamat Default Bandung'
                  : 'Pengaturan Profil & Kontak'}
              </h3>
              <button
                type="button"
                onClick={() => setAccountModalMode(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {accountModalMode === 'address' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentUser({
                    ...currentUser,
                    district: editDistrictText,
                    defaultAddress: editAddressText.trim() || currentUser.defaultAddress,
                  });
                  setAccountModalMode(null);
                  setRecentToast('Alamat default berhasil diperbarui!');
                  window.setTimeout(() => setRecentToast(null), 2500);
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Kecamatan di Bandung
                  </label>
                  <select
                    value={editDistrictText}
                    onChange={(e) => setEditDistrictText(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                  >
                    <option value="Coblong (Dago / Dipatiukur)">Coblong (Dago / Dipatiukur)</option>
                    <option value="Sumur Bandung (Braga)">Sumur Bandung (Braga)</option>
                    <option value="Bandung Wetan (Riau / Citarum)">Bandung Wetan (Riau / Citarum)</option>
                    <option value="Lengkong (Burangrang)">Lengkong (Burangrang)</option>
                    <option value="Buahbatu">Buahbatu</option>
                    <option value="Sukasari (Setiabudi)">Sukasari (Setiabudi)</option>
                    <option value="Cicendo (Pasirkaliki)">Cicendo (Pasirkaliki)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Lengkap Default
                  </label>
                  <textarea
                    rows={3}
                    value={editAddressText}
                    onChange={(e) => setEditAddressText(e.target.value)}
                    placeholder="Contoh: Jl. Dipatiukur No. 42, Coblong, Bandung"
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAccountModalMode(null)}
                    className="h-10 px-4 text-xs font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 text-xs font-semibold text-white bg-[#1F281A] hover:bg-emerald-900 rounded-xl cursor-pointer"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentUser({
                    ...currentUser,
                    name: editNameText.trim() || currentUser.name,
                    phone: editPhoneText.trim() || currentUser.phone,
                  });
                  setAccountModalMode(null);
                  setRecentToast('Profil akun berhasil diperbarui!');
                  window.setTimeout(() => setRecentToast(null), 2500);
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editNameText}
                    onChange={(e) => setEditNameText(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editPhoneText}
                    onChange={(e) => setEditPhoneText(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 font-mono-tabular"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAccountModalMode(null)}
                    className="h-10 px-4 text-xs font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 text-xs font-semibold text-white bg-[#1F281A] hover:bg-emerald-900 rounded-xl cursor-pointer"
                  >
                    Simpan Profil
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAVBAR (HOME BAR): UTAMA, PESANAN, CHAT PENJUAL, DAN HISTORY (Hanya di dalam aplikasi pemesanan) */}
      {activePage !== 'landing' && activePage !== 'auth' && activePage !== 'admin' && (
        <nav
          aria-label="Navigasi Bawah"
          className="fixed bottom-0 inset-x-0 z-40 h-16 bg-white border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-2"
        >
          <button
            type="button"
            onClick={openEtalasePage}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activePage === 'etalase'
                ? 'text-[#8da249] font-bold'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px]">Utama</span>
          </button>

          <button
            type="button"
            onClick={openOrdersPage}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activePage === 'pesanan'
                ? 'text-[#8da249] font-bold'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            <div className="relative">
              <ClipboardList className="w-5 h-5" />
              {activeOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#f89254] text-white text-[9px] font-bold font-mono-tabular flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </div>
            <span className="text-[11px]">Pesanan</span>
          </button>

          <button
            type="button"
            onClick={() => openChatPage()}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activePage === 'chat' || activePage === 'chat-bot'
                ? 'text-[#8da249] font-bold'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#f89254]" />
            </div>
            <span className="text-[11px]">Chat Penjual</span>
          </button>

          <button
            type="button"
            onClick={openHistoryPage}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activePage === 'history'
                ? 'text-[#8da249] font-bold'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[11px]">History</span>
          </button>
        </nav>
      )}

      {/* FLOATING AI ASSISTANT BOT WIDGET (USER SIDE - HANYA DI DALAM APLIKASI PEMESANAN) */}
      {activePage !== 'landing' && activePage !== 'admin' && activePage !== 'auth' && activePage !== 'chat' && activePage !== 'chat-bot' && (
        <FloatingChatButton
          onOpenChatBot={openChatBotPage}
        />
      )}
    </div>
  );
}


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

  return (
    <div className="flex h-screen w-full bg-white text-[#2e434f] overflow-hidden">
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

function MainAppDispatcher() {
  const { activeTab } = useApp();

  if (activeTab === 'admin' || activeTab === 'marketplace') {
    return <CustomerAndAdminPortal />;
  }

  return <SellerPortalContent />;
}

export default function App() {
  return (
    <AppProvider>
      <MainAppDispatcher />
    </AppProvider>
  );
}
