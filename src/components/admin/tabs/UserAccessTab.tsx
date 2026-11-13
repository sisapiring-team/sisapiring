import React, { useId, useState, useCallback } from 'react';
import {
  Search, Users, SlidersHorizontal, X, ChevronDown,
  CheckCircle2, AlertTriangle, Ban, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, AlertCircle, Store, Shield,
} from 'lucide-react';
import { useAdminUsers, type AdminUser, type UserRoleFilter, type UserStatusFilter } from '../../../hooks/useAdminUsers';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const ROLE_CFG: Record<string, { label: string; bg: string; color: string }> = {
  admin:  { label: 'Admin',  bg: '#fef3c7', color: '#92400e' },
  seller: { label: 'UMKM',  bg: '#d1fae5', color: '#065f46' },
  buyer:  { label: 'Buyer', bg: '#dbeafe', color: '#1e40af' },
};

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  active:    { label: 'Aktif',      bg: '#d1fae5', color: '#065f46', Icon: CheckCircle2 },
  warning:   { label: 'Peringatan', bg: '#fef3c7', color: '#92400e', Icon: AlertTriangle },
  suspended: { label: 'Suspended',  bg: '#fee2e2', color: '#991b1b', Icon: Ban },
};

/* ─── Confirm Modal ───────────────────────────────────────────────────── */
interface ConfirmModalProps {
  user: AdminUser;
  nextStatus: 'active' | 'warning' | 'suspended';
  onClose: () => void;
  onConfirm: (id: number, status: 'active' | 'warning' | 'suspended', note?: string) => Promise<void>;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ user, nextStatus, onClose, onConfirm }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onConfirm(user.id, nextStatus, note || undefined); onClose(); }
    finally { setLoading(false); }
  };

  const labels: Record<string, string> = {
    active: 'Aktifkan',
    warning: 'Beri Peringatan',
    suspended: 'Bekukan',
  };
  const danger = nextStatus === 'suspended';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 420, width: '100%', padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {danger ? <Ban size={16} style={{ color: '#c0392b' }} /> : <CheckCircle2 size={16} style={{ color: '#6a8338' }} />}
          {labels[nextStatus]} akun
        </h3>
        <div style={{ background: '#f6f8f2', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
          <strong style={{ display: 'block', color: '#283529' }}>{user.name}</strong>
          <span style={{ color: '#5b6855' }}>{user.email}</span>
          <span style={{ display: 'block', color: '#8b967f', fontSize: 11, marginTop: 2 }}>{user.role}</span>
        </div>
        {nextStatus !== 'active' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5b6855', display: 'block', marginBottom: 5 }}>Catatan (opsional):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={danger ? 'Alasan pembekuan…' : 'Catatan peringatan…'}
              style={{ width: '100%', minHeight: 60, border: '1px solid #d9e1cf', borderRadius: 9, padding: 9, fontSize: 12, resize: 'vertical', background: '#f6f8f2', fontFamily: 'inherit' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #e5eadf', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#5f6c5c' }}>Batal</button>
          <button
            type="button"
            onClick={handle}
            disabled={loading}
            style={{ background: danger ? '#c0392b' : '#1F281A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {labels[nextStatus]}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Tab ────────────────────────────────────────────────────────── */
export const UserAccessTab: React.FC = () => {
  const searchId  = useId();
  const roleId    = useId();
  const statusId  = useId();

  const [roleFilter,   setRoleFilter]   = useState<UserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [debouncedQ,   setDebouncedQ]   = useState('');
  const [page,         setPage]         = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<{ user: AdminUser; nextStatus: 'active' | 'warning' | 'suspended' } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(searchQuery); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { users, loading, error, totalPages, total, reload, updateStatus } =
    useAdminUsers(roleFilter, statusFilter, debouncedQ, page);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpdateStatus = useCallback(async (id: number, status: 'active' | 'warning' | 'suspended', note?: string) => {
    await updateStatus(id, status, note);
    const labels = { active: 'Akun diaktifkan.', warning: 'Peringatan diberikan.', suspended: 'Akun dibekukan.' };
    showToast(labels[status]);
  }, [updateStatus]);

  const hasFilters = searchQuery.trim().length > 0 || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 1280, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, background: '#1F281A', color: '#fff', padding: '12px 18px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {confirmTarget && (
        <ConfirmModal
          user={confirmTarget.user}
          nextStatus={confirmTarget.nextStatus}
          onClose={() => setConfirmTarget(null)}
          onConfirm={handleUpdateStatus}
        />
      )}

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 16, background: '#edf2e4', color: '#6a8338', border: '1px solid #dce6cb', flexShrink: 0 }}>
          <Users size={24} strokeWidth={1.7} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7d59', marginBottom: 2 }}>SisaPiring · Akun</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.5px', margin: 0 }}>Manajemen Akun (RBAC)</h2>
          <p style={{ color: '#5b6855', fontSize: 15, marginTop: 2 }}>Kelola akun buyer, seller, dan admin platform.</p>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #d9e1cf', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#5b6855', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 18px', background: '#fff', border: '1px solid #e3e9db', borderRadius: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 650 }}>
          Daftar akun
          <span style={{ display: 'block', fontSize: 13, fontWeight: 400, color: '#5b6855', marginTop: 2 }}>
            {loading ? 'Memuat...' : `${total.toLocaleString('id-ID')} akun`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 240 }}>
            <label htmlFor={searchId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Cari nama atau email</label>
            <Search size={15} style={{ position: 'absolute', left: 13, color: '#6f8062', pointerEvents: 'none' }} />
            <input
              id={searchId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email…"
              style={{ width: '100%', height: 42, background: '#f6f8f2', border: '1px solid #d9e1cf', borderRadius: 11, padding: '0 34px 0 38px', fontSize: 14, color: '#283529', fontFamily: 'inherit' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, background: 'none', border: 0, cursor: 'pointer', color: '#5f6e53' }}><X size={14} /></button>
            )}
          </div>
          {/* Role filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <label htmlFor={roleId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Filter role</label>
            <Shield size={13} style={{ position: 'absolute', left: 11, color: '#6f8062', pointerEvents: 'none' }} />
            <select
              id={roleId}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as UserRoleFilter); setPage(1); }}
              style={{ appearance: 'none', height: 42, width: 148, border: '1px solid #d9e1cf', background: '#fff', borderRadius: 11, padding: '0 28px 0 30px', fontSize: 13, fontWeight: 500, color: '#44513f', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="all">Semua role</option>
              <option value="buyer">Buyer</option>
              <option value="seller">UMKM</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, color: '#6f8062', pointerEvents: 'none' }} />
          </div>
          {/* Status filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <label htmlFor={statusId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Filter status</label>
            <SlidersHorizontal size={13} style={{ position: 'absolute', left: 11, color: '#6f8062', pointerEvents: 'none' }} />
            <select
              id={statusId}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as UserStatusFilter); setPage(1); }}
              style={{ appearance: 'none', height: 42, width: 162, border: '1px solid #d9e1cf', background: '#fff', borderRadius: 11, padding: '0 28px 0 30px', fontSize: 13, fontWeight: 500, color: '#44513f', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="warning">Peringatan</option>
              <option value="suspended">Dibekukan</option>
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, color: '#6f8062', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#5b6855' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: 15 }}>Memuat data akun…</span>
        </div>
      ) : error ? (
        <div style={{ border: '1px dashed #d3dcc4', borderRadius: 16, textAlign: 'center', padding: '48px 24px' }}>
          <AlertCircle size={22} style={{ color: '#6a8338', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>Gagal memuat data</h3>
          <p style={{ color: '#5b6855', fontSize: 14 }}>{error}</p>
          <button type="button" onClick={() => reload()} style={{ marginTop: 14, border: '1px solid #cfdcb9', background: '#f0f5e8', color: '#4b6529', borderRadius: 10, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Coba lagi</button>
        </div>
      ) : users.length > 0 ? (
        <>
          <div style={{ background: '#fff', border: '1px solid #e5eadf', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8faf5', borderBottom: '1px solid #edf0e7' }}>
                    {['Nama Pengguna', 'Kontak', 'Peran', 'Kecamatan', 'Pelanggaran', 'Status', 'Aksi'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 650, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5f6e54', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role   = ROLE_CFG[user.role]   ?? { label: user.role,          bg: '#f0f2ed', color: '#53624a' };
                    const status = STATUS_CFG[user.accountStatus] ?? { label: user.accountStatus, bg: '#f0f2ed', color: '#53624a', Icon: CheckCircle2 };

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f0f2ed', transition: 'background .15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafcf8')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        {/* Name */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#283529' }}>{user.name}</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b967f', marginTop: 2 }}>ID #{user.id}</div>
                          {user.merchant && (
                            <div style={{ fontSize: 11, color: '#5b6855', display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                              <Store size={9} />
                              {user.merchant.businessName}
                            </div>
                          )}
                        </td>
                        {/* Contact */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#283529' }}>{user.email}</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b967f', marginTop: 2 }}>{user.phone}</div>
                        </td>
                        {/* Role */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', background: role.bg, color: role.color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
                            {role.label}
                          </span>
                        </td>
                        {/* District */}
                        <td style={{ padding: '12px 16px', color: '#44513f', fontWeight: 600 }}>
                          {user.district ?? '—'}
                        </td>
                        {/* Violations */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: user.violationCount > 0 ? '#c0392b' : '#5b6855' }}>
                            {user.violationCount}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: status.bg, color: status.color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
                            <status.Icon size={10} />
                            {status.label}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            {user.accountStatus !== 'active' && (
                              <button
                                type="button"
                                onClick={() => setConfirmTarget({ user, nextStatus: 'active' })}
                                style={{ background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                              >
                                Aktifkan
                              </button>
                            )}
                            {user.accountStatus !== 'warning' && user.accountStatus !== 'suspended' && (
                              <button
                                type="button"
                                onClick={() => setConfirmTarget({ user, nextStatus: 'warning' })}
                                style={{ background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                              >
                                Peringatan
                              </button>
                            )}
                            {user.accountStatus !== 'suspended' && (
                              <button
                                type="button"
                                onClick={() => setConfirmTarget({ user, nextStatus: 'suspended' })}
                                style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                              >
                                Bekukan
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

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ width: 36, height: 36, border: '1px solid #d9e1cf', borderRadius: 9, background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: page <= 1 ? .4 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: '#5b6855' }}>Halaman {page} dari {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ width: 36, height: 36, border: '1px solid #d9e1cf', borderRadius: 9, background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: page >= totalPages ? .4 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ border: '1px dashed #d3dcc4', borderRadius: 16, textAlign: 'center', padding: '48px 24px' }}>
          <Users size={22} style={{ color: '#6a8338', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>{hasFilters ? 'Akun tidak ditemukan' : 'Belum ada akun'}</h3>
          <p style={{ color: '#5b6855', fontSize: 14 }}>{hasFilters ? 'Coba ubah filter atau kata kunci.' : 'Akun pengguna akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }} style={{ marginTop: 14, border: '1px solid #cfdcb9', background: '#f0f5e8', color: '#4b6329', borderRadius: 10, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Reset filter</button>
          )}
        </div>
      )}
    </div>
  );
};
