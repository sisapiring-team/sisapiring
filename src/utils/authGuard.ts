import { parseRoute } from './navigation';

export type NormalizedRole = 'admin' | 'seller' | 'buyer';

export function normalizeRole(role: string | null | undefined): NormalizedRole | null {
  if (!role) return null;
  const lower = role.trim().toLowerCase();
  if (lower === 'admin') return 'admin';
  if (lower === 'seller' || lower === 'penjual' || lower === 'umkm' || lower === 'merchant') {
    return 'seller';
  }
  return 'buyer';
}

export interface RouteAccessCheck {
  allowed: boolean;
  redirectPath: string;
  notice?: string;
}

/**
 * Strict Role-Based Access Control (RBAC) Route Guard:
 * - Admin can ONLY access /admin
 * - Seller can ONLY access /penjual
 * - Buyer can ONLY access user pages (/etalase, /kantong, /pesanan, etc.) and is blocked from /penjual and /admin
 * - Guest is prompted to log in when accessing protected routes
 */
export function checkRoleRouteAccess(
  targetPath: string,
  role: string | null | undefined
): RouteAccessCheck {
  const norm = normalizeRole(role);
  const parsed = parseRoute(targetPath);

  // 1. ADMIN ROLE: Restricted strictly to /admin
  if (norm === 'admin') {
    if (parsed.page === 'admin') {
      return { allowed: true, redirectPath: '/admin' };
    }
    return {
      allowed: false,
      redirectPath: '/admin',
      notice: 'Sesi Admin aktif: Anda telah masuk sebagai Administrator.',
    };
  }

  // 2. SELLER ROLE: Restricted strictly to /penjual
  if (norm === 'seller') {
    if (parsed.page === 'penjual') {
      return { allowed: true, redirectPath: targetPath };
    }
    return {
      allowed: false,
      redirectPath: '/penjual',
      notice: 'Sesi Penjual aktif: Anda telah masuk sebagai Mitra Penjual.',
    };
  }

  // 3. BUYER ROLE: Blocked from /penjual, /admin, and cannot re-access /auth while logged in
  if (norm === 'buyer') {
    if (parsed.page === 'auth') {
      return {
        allowed: false,
        redirectPath: '/etalase',
        notice: 'Anda sudah masuk. Silakan logout terlebih dahulu jika ingin mengganti akun.',
      };
    }
    if (parsed.page === 'penjual') {
      return {
        allowed: false,
        redirectPath: '/etalase',
        notice: 'Akses Dibatasi: Akun Pembeli tidak memiliki izin akses ke Portal Penjual.',
      };
    }
    if (parsed.page === 'admin') {
      return {
        allowed: false,
        redirectPath: '/etalase',
        notice: 'Akses Dibatasi: Akun Pembeli tidak memiliki izin akses ke Panel Admin.',
      };
    }
    return { allowed: true, redirectPath: targetPath };
  }

  // 4. GUEST (UNAUTHENTICATED)
  if (parsed.page === 'penjual') {
    return {
      allowed: false,
      redirectPath: '/auth',
      notice: 'Silakan masuk dengan akun Penjual untuk mengakses Portal Penjual.',
    };
  }

  if (parsed.page === 'pesanan' || parsed.page === 'history') {
    return {
      allowed: false,
      redirectPath: '/auth',
      notice: 'Silakan masuk terlebih dahulu untuk melihat pesanan Anda.',
    };
  }

  // Allow public etalase, store, chat, and admin login gate
  return { allowed: true, redirectPath: targetPath };
}
