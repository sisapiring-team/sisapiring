export type AppRoute =
  | 'landing'
  | 'etalase'
  | 'kantong'
  | 'pesanan'
  | 'history'
  | 'chat'
  | 'chat-bot'
  | 'store'
  | 'admin'
  | 'penjual'
  | 'auth';

export interface RouteState {
  page: AppRoute;
  sellerTab?: string;
  merchantName?: string;
}

/**
 * Parses any incoming browser pathname into canonical route state
 * Handles /admin, /penjual, /chat, /chat/bot, /etalase, /pesanan, /history, /toko/:name, etc.
 */
export function parseRoute(pathname: string): RouteState {
  const normalized = (pathname || '/').trim().replace(/\/+$/, '') || '/';
  const lower = normalized.toLowerCase();

  // 1. Admin Governance Workspace
  if (lower === '/admin' || lower.startsWith('/admin/')) {
    return { page: 'admin' };
  }

  // 2. Mitra UMKM Seller Portal (e.g. /penjual, /penjual/products, /penjual/orders)
  if (
    lower === '/penjual' ||
    lower.startsWith('/penjual/') ||
    lower === '/mitra' ||
    lower.startsWith('/mitra/')
  ) {
    const parts = lower.split('/');
    const subTab = parts[2] || 'dashboard';
    return { page: 'penjual', sellerTab: subTab };
  }

  // 3. SisaPiring AI Assistant Chat (Dedicated Page)
  if (
    lower === '/chat/bot' ||
    lower === '/chat-bot' ||
    lower === '/chat-ai' ||
    lower === '/bot'
  ) {
    return { page: 'chat-bot' };
  }

  // 4. Seller Contact Chat (Dedicated Full-Screen Page)
  if (lower === '/chat' || lower.startsWith('/chat/')) {
    const parts = normalized.split('/');
    const merchantName = parts[2] ? decodeURIComponent(parts[2]) : undefined;
    return { page: 'chat', merchantName };
  }

  // 5. Food Marketplace / Etalase
  if (lower === '/etalase' || lower === '/makanan' || lower === '/marketplace') {
    return { page: 'etalase' };
  }

  // 6. Cart / Kantong Penyelamatan
  if (lower === '/kantong' || lower === '/keranjang' || lower === '/cart') {
    return { page: 'kantong' };
  }

  // 7. Active Orders Tracking
  if (lower === '/pesanan' || lower === '/orders') {
    return { page: 'pesanan' };
  }

  // 8. Completed Orders History
  if (lower === '/history' || lower === '/riwayat') {
    return { page: 'history' };
  }

  // 9. Store Profile View (e.g. /toko/Warung%20Nasi%20Ampera)
  if (lower.startsWith('/toko/') || lower.startsWith('/store/')) {
    const parts = normalized.split('/');
    const rawMerchant = parts.slice(2).join('/');
    return {
      page: 'store',
      merchantName: rawMerchant ? decodeURIComponent(rawMerchant) : undefined,
    };
  }

  // 10. Login & Registration
  if (lower === '/auth' || lower === '/login' || lower === '/register') {
    return { page: 'auth' };
  }

  // 11. Default: Landing Page
  return { page: 'landing' };
}

/**
 * Builds canonical URL path string from route state
 */
export function buildRoutePath(route: RouteState): string {
  switch (route.page) {
    case 'admin':
      return '/admin';
    case 'penjual':
      return route.sellerTab && route.sellerTab !== 'dashboard'
        ? `/penjual/${route.sellerTab}`
        : '/penjual';
    case 'chat':
      return route.merchantName
        ? `/chat/${encodeURIComponent(route.merchantName)}`
        : '/chat';
    case 'chat-bot':
      return '/chat/bot';
    case 'etalase':
      return '/etalase';
    case 'kantong':
      return '/kantong';
    case 'pesanan':
      return '/pesanan';
    case 'history':
      return '/history';
    case 'store':
      return route.merchantName
        ? `/toko/${encodeURIComponent(route.merchantName)}`
        : '/etalase';
    case 'auth':
      return '/auth';
    case 'landing':
    default:
      return '/';
  }
}

/**
 * Pushes path to browser history without reloading the page
 */
export function pushRoute(path: string) {
  if (typeof window !== 'undefined' && window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
}
