import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_SELLER_PROFILE } from '../data/initialData';
import {
  applyProductDiscountRemote,
  cancelOrderRemote,
  createOrderRemote,
  createProductRemote,
  deleteProductRemote,
  fetchCurrentMerchant,
  fetchOrders,
  fetchProducts,
  getStoredRole,
  updateMerchantRemote,
  updateOrderStatusRemote,
  updateProductRemote,
  updateProductStockRemote,
  verifyOrderRemote,
} from '../lib/api';
import { Order, OrderStatus, SellerProfile, SisaPiringProduct, VerificationStatus } from '../types/seller';
import { parseRoute } from '../utils/navigation';
import { checkRoleRouteAccess } from '../utils/authGuard';

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'rescue_deals'
  | 'qr_pickup'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'registration'
  | 'marketplace'
  | 'admin';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sellerProfile: SellerProfile;
  updateSellerProfile: (updates: Partial<SellerProfile>) => void;
  setVerificationStatus: (status: VerificationStatus, notes?: string) => void;
  products: SisaPiringProduct[];
  addProduct: (productData: Omit<SisaPiringProduct, 'id' | 'createdAt' | 'portionsRescuedCount'>) => SisaPiringProduct;
  updateProduct: (id: string, updates: Partial<SisaPiringProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  updateStock: (id: string, delta: number) => void;
  applyDiscount: (id: string, discount: 50 | 70 | 90 | 100) => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  verifyPickupCode: (codeOrQr: string) => { success: boolean; message: string; order?: Order };
  createCustomerOrder: (
    items: { productId: string; quantity: number }[],
    customerName: string,
    customerPhone: string
  ) => Order;
  registerCustomerOrder: (order: Order) => void;
  ordersFilterStatus: 'all' | OrderStatus;
  setOrdersFilterStatus: (status: 'all' | OrderStatus) => void;
  navigateToOrdersWithFilter: (status: 'all' | OrderStatus) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isFoodSafetyModalOpen: boolean;
  setIsFoodSafetyModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;
  refreshRemoteData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_SELLER = 'sisapiring_seller_profile_v2';
const STORAGE_KEY_PRODUCTS = 'sisapiring_products_v2';
const STORAGE_KEY_ORDERS = 'sisapiring_orders_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = getStoredRole();
      const currentPath = window.location.pathname;
      const guard = checkRoleRouteAccess(currentPath, storedRole);
      const effectivePath = guard.allowed ? currentPath : guard.redirectPath;
      if (!guard.allowed && effectivePath !== currentPath) {
        window.history.replaceState(null, '', effectivePath);
      }
      const route = parseRoute(effectivePath);
      if (route.page === 'admin') return 'admin';
      if (route.page === 'penjual') {
        const validSellerTabs: ActiveTab[] = [
          'dashboard',
          'products',
          'orders',
          'rescue_deals',
          'qr_pickup',
          'analytics',
          'profile',
          'settings',
          'registration',
        ];
        return validSellerTabs.includes(route.sellerTab as ActiveTab)
          ? (route.sellerTab as ActiveTab)
          : 'dashboard';
      }
    }
    return 'marketplace';
  });

  // Listen to popstate for browser Back/Forward between portals
  useEffect(() => {
    const handlePopState = () => {
      const storedRole = getStoredRole();
      const currentPath = window.location.pathname;
      const guard = checkRoleRouteAccess(currentPath, storedRole);
      const effectivePath = guard.allowed ? currentPath : guard.redirectPath;
      if (!guard.allowed && effectivePath !== currentPath) {
        window.history.replaceState(null, '', effectivePath);
      }
      const route = parseRoute(effectivePath);
      if (route.page === 'admin') {
        setActiveTab('admin');
      } else if (route.page === 'penjual') {
        const validSellerTabs: ActiveTab[] = [
          'dashboard',
          'products',
          'orders',
          'rescue_deals',
          'qr_pickup',
          'analytics',
          'profile',
          'settings',
          'registration',
        ];
        setActiveTab(
          validSellerTabs.includes(route.sellerTab as ActiveTab)
            ? (route.sellerTab as ActiveTab)
            : 'dashboard'
        );
      } else {
        setActiveTab('marketplace');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [ordersFilterStatus, setOrdersFilterStatus] = useState<'all' | OrderStatus>('all');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isFoodSafetyModalOpen, setIsFoodSafetyModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize seller profile
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SELLER);
      return saved ? JSON.parse(saved) : INITIAL_SELLER_PROFILE;
    } catch {
      return INITIAL_SELLER_PROFILE;
    }
  });

  // Initialize products
  const [products, setProducts] = useState<SisaPiringProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Initialize orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SELLER, JSON.stringify(sellerProfile));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [sellerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [orders]);

  // Hydrate from the Laravel API when it is reachable. Falling back to the
  // localStorage snapshot keeps the SPA usable while the backend is offline.
  const refreshRemoteData = useCallback(async () => {
    const [merchantResult, productsResult, ordersResult] = await Promise.allSettled([
      fetchCurrentMerchant(),
      fetchProducts(),
      fetchOrders(),
    ]);

    if (merchantResult.status === 'fulfilled' && merchantResult.value) {
      setSellerProfile((prev) => ({ ...prev, ...merchantResult.value }));
    }

    if (productsResult.status === 'fulfilled' && productsResult.value.length > 0) {
      setProducts(productsResult.value);
    }

    if (ordersResult.status === 'fulfilled' && ordersResult.value.length > 0) {
      setOrders(ordersResult.value);
    }
  }, []);

  useEffect(() => {
    void refreshRemoteData();
  }, [refreshRemoteData]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSellerProfile = (updates: Partial<SellerProfile>) => {
    setSellerProfile((prev) => ({ ...prev, ...updates }));
    void updateMerchantRemote(sellerProfile.id, updates).catch(() => undefined);
    showToast('Profil Berhasil Diperbarui', 'Data profil usaha UMKM Anda telah disimpan.', 'success');
  };

  const setVerificationStatus = (status: VerificationStatus, notes?: string) => {
    setSellerProfile((prev) => ({
      ...prev,
      verificationStatus: status,
      verificationNotes: notes || prev.verificationNotes,
    }));
    void updateMerchantRemote(sellerProfile.id, {
      verificationStatus: status,
      verificationNotes: notes,
    }).catch(() => undefined);
    const statusLabel =
      status === 'verified' ? 'Terverifikasi' : status === 'pending_review' ? 'Menunggu Peninjauan' : 'Ditolak';
    showToast('Status Verifikasi Berubah', `Status akun UMKM saat ini: ${statusLabel}`, 'info');
  };

  const addProduct = (
    productData: Omit<SisaPiringProduct, 'id' | 'createdAt' | 'portionsRescuedCount'>
  ): SisaPiringProduct => {
    const tempId = `PRD-${Date.now().toString().slice(-4)}`;
    const newProduct: SisaPiringProduct = {
      ...productData,
      id: tempId,
      createdAt: new Date().toISOString(),
      portionsRescuedCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    createProductRemote(productData)
      .then((created) => {
        if (created?.id) {
          setProducts((prev) =>
            prev.map((p) => (p.id === tempId ? { ...created, ...productData, id: created.id } : p))
          );
        }
      })
      .catch(() => undefined);

    showToast(
      'Produk Sisa Piring Berhasil Diterbitkan',
      `"${newProduct.name}" kini tayang di etalase SisaPiring Bandung.`,
      'success'
    );
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<SisaPiringProduct>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          // If discount changed, recalculate discountedPrice
          if (updates.discountPercentage !== undefined || updates.originalPrice !== undefined) {
            const disc = updates.discountPercentage ?? p.discountPercentage;
            const orig = updates.originalPrice ?? p.originalPrice;
            updated.discountedPrice = disc === 100 ? 0 : Math.round(orig * (1 - disc / 100));
          }
          return updated;
        }
        return p;
      })
    );
    void updateProductRemote(id, updates).catch(() => undefined);
    showToast('Produk Diperbarui', 'Perubahan produk sisa piring berhasil disimpan.', 'success');
  };

  const deleteProduct = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
    void deleteProductRemote(id).catch(() => undefined);
    showToast('Produk Dihapus', `Produk "${p?.name || id}" telah dihapus dari etalase.`, 'info');
  };

  const toggleProductStatus = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) {
      return;
    }

    const nextState = !target.isActive;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: nextState } : p)));
    void updateProductRemote(id, { isActive: nextState }).catch(() => undefined);
    showToast(
      nextState ? 'Produk Diaktifkan' : 'Produk Dinonaktifkan',
      `Status "${target.name}" sekarang ${nextState ? 'Aktif' : 'Nonaktif'}.`,
      'info'
    );
  };

  const updateStock = (id: string, delta: number) => {
    const current = products.find((p) => p.id === id);
    const nextStock = Math.max(0, (current?.stock ?? 0) + delta);

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: nextStock } : p))
    );
    void updateProductStockRemote(id, nextStock).catch(() => undefined);
  };

  const applyDiscount = (id: string, discount: 50 | 70 | 90 | 100) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const discountedPrice = discount === 100 ? 0 : Math.round(p.originalPrice * (1 - discount / 100));
          return {
            ...p,
            discountPercentage: discount,
            discountedPrice,
          };
        }
        return p;
      })
    );
    void applyProductDiscountRemote(id, discount).catch(() => undefined);
    showToast('Diskon Penyelamatan Diterapkan', `Diskon ${discount}% berhasil diatur untuk produk.`, 'success');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const timestamp = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()) + ' WIB';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            statusHistory: [...o.statusHistory, { status, timestamp, note }],
          };
        }
        return o;
      })
    );

    void updateOrderStatusRemote(orderId, status, note).catch(() => undefined);

    const labels: Record<OrderStatus, string> = {
      waiting_confirmation: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      ready_for_pickup: 'Siap Diambil',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    showToast('Status Pesanan Diperbarui', `Pesanan ${orderId} diubah menjadi "${labels[status]}".`, 'success');
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const timestamp = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()) + ' WIB';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled',
            cancellationReason: reason,
            statusHistory: [
              ...o.statusHistory,
              { status: 'cancelled', timestamp, note: `Dibatalkan: ${reason}` },
            ],
          };
        }
        return o;
      })
    );
    void cancelOrderRemote(orderId, reason).catch(() => undefined);
    showToast('Pesanan Dibatalkan', `Pesanan ${orderId} telah dibatalkan.`, 'warning');
  };

  const verifyPickupCode = (rawInput: string): { success: boolean; message: string; order?: Order } => {
    const cleanCode = rawInput.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Harap masukkan kode pengambilan atau scan QR code pelanggan.' };
    }

    // Match either by pickupCode (e.g. SP-7842) or full orderId (e.g. SP-BDG-2026-081)
    const order = orders.find(
      (o) => o.pickupCode.toUpperCase() === cleanCode || o.id.toUpperCase() === cleanCode
    );

    if (!order) {
      return {
        success: false,
        message: `Kode "${cleanCode}" tidak ditemukan dalam sistem pesanan SisaPiring. Periksa kembali kode pengambilan.`,
      };
    }

    if (order.status === 'completed') {
      return {
        success: false,
        message: `Kode "${order.pickupCode}" SUDAH PERNAH DIGUNAKAN sebelumnya pada ${order.verifiedAt || 'transaksi sebelumnya'}. Pengambilan ganda tidak diperbolehkan.`,
        order,
      };
    }

    if (order.status === 'cancelled') {
      return {
        success: false,
        message: `Pesanan ${order.id} telah berstatus DIBATALKAN. Tidak dapat melakukan verifikasi pengambilan.`,
        order,
      };
    }

    // Success: mark as completed and verified
    const timestamp = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()) + ' WIB';

    let rescuedItemsCount = 0;
    order.items.forEach((item) => {
      rescuedItemsCount += item.quantity;
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === order.id) {
          return {
            ...o,
            status: 'completed',
            isVerifiedByQR: true,
            verifiedAt: timestamp,
            statusHistory: [
              ...o.statusHistory,
              {
                status: 'completed',
                timestamp,
                note: 'Verifikasi sukses melalui Scan QR / Kode PIN Kasir',
              },
            ],
          };
        }
        return o;
      })
    );

    void verifyOrderRemote(order.id, order.pickupCode).catch(() => undefined);

    // Update portionsRescuedCount for the products
    setProducts((prev) =>
      prev.map((p) => {
        const matchingItem = order.items.find((item) => item.productId === p.id);
        if (matchingItem) {
          return {
            ...p,
            portionsRescuedCount: p.portionsRescuedCount + matchingItem.quantity,
          };
        }
        return p;
      })
    );

    showToast(
      'Pengambilan Berhasil Diverifikasi!',
      `Pesanan ${order.id} untuk ${order.customerName} telah resmi diserahkan. Sebanyak ${rescuedItemsCount} porsi makanan berhasil diselamatkan!`,
      'success'
    );

    return {
      success: true,
      message: `Verifikasi sukses! Pesanan ${order.id} (${order.customerName}) telah selesai diambil.`,
      order: {
        ...order,
        status: 'completed',
        isVerifiedByQR: true,
        verifiedAt: timestamp,
      },
    };
  };

  const createCustomerOrder = (
    cartItems: { productId: string; quantity: number }[],
    customerName: string,
    customerPhone: string
  ): Order => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const pickupCode = `SP-${randomDigits}`;
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const id = `SP-BDG-2026-${orderNumber}`;

    const items: Order['items'] = [];
    let totalPayment = 0;

    cartItems.forEach((ci) => {
      const prod = products.find((p) => p.id === ci.productId);
      if (prod) {
        items.push({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          pricePerItem: prod.discountedPrice,
          quantity: ci.quantity,
          image: prod.image,
        });
        totalPayment += prod.discountedPrice * ci.quantity;

        // Decrease stock
        updateStock(prod.id, -ci.quantity);
      }
    });

    const timestamp = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()) + ' WIB';

    const newOrder: Order = {
      id,
      pickupCode,
      customerName,
      customerPhone,
      items,
      totalPayment,
      orderDate: timestamp,
      pickupDeadline: 'Hari ini, 21:00 WIB',
      status: 'waiting_confirmation',
      statusHistory: [
        { status: 'waiting_confirmation', timestamp, note: 'Pesanan dibuat oleh pembeli di Marketplace SisaPiring' },
      ],
      isVerifiedByQR: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    void createOrderRemote(cartItems, customerName, customerPhone).catch(() => undefined);
    showToast('Pesanan Baru Diterima!', `Pesanan ${newOrder.id} dari ${customerName} telah masuk.`, 'info');
    return newOrder;
  };

  const registerCustomerOrder = (newOrder: Order) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrder.id || o.pickupCode === newOrder.pickupCode)) {
        return prev;
      }
      return [newOrder, ...prev];
    });
    void createOrderRemote(
      newOrder.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      newOrder.customerName,
      newOrder.customerPhone
    ).catch(() => undefined);
    showToast(
      'Pesanan Masuk dari Etalase!',
      `Pesanan #${newOrder.pickupCode} (${newOrder.customerName}) siap dikonfirmasi di antrean.`,
      'info'
    );
  };

  const resetAllDemoData = () => {
    setSellerProfile(INITIAL_SELLER_PROFILE);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    localStorage.removeItem(STORAGE_KEY_SELLER);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    showToast('Data Demo Direset', 'Semua data contoh produk dan pesanan telah dikembalikan ke awal.', 'info');
  };

  const navigateToOrdersWithFilter = (status: 'all' | OrderStatus) => {
    setOrdersFilterStatus(status);
    setActiveTab('orders');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        ordersFilterStatus,
        setOrdersFilterStatus,
        navigateToOrdersWithFilter,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isFoodSafetyModalOpen,
        setIsFoodSafetyModalOpen,
        sellerProfile,
        updateSellerProfile,
        setVerificationStatus,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        updateStock,
        applyDiscount,
        orders,
        updateOrderStatus,
        cancelOrder,
        verifyPickupCode,
        createCustomerOrder,
        registerCustomerOrder,
        toasts,
        showToast,
        removeToast,
        resetAllDemoData,
        refreshRemoteData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
