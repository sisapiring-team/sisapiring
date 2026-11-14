import React, { useId, useState, useCallback } from 'react';
import {
  Store, Search, CheckCircle2, Clock, Ban, Eye, X, ChevronDown,
  SlidersHorizontal, MapPin, Phone, User, FileCheck2, ExternalLink,
  ArrowUpRight, AlertCircle, Loader2, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { ResilientImage } from '../../ResilientImage';
import { useAdminMerchants, type MerchantStatusFilter } from '../../../hooks/useAdminMerchants';
import type { AdminMerchant } from '../../../lib/api';

interface SellerGovernanceTabProps {
  onSwitchToSellerPortal?: () => void;
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
.sp-seller{
  --sg-ink:#283529;--sg-text:#44513f;--sg-muted:#5b6855;--sg-line:#e3e9db;--sg-bg:#f6f8f2;
  --sg-green:#69823c;--sg-green-dark:#556d2f;--sg-soft:#edf2e4;
  font-family:inherit;color:var(--sg-ink);display:grid;gap:24px;max-width:1280px;margin:0 auto;font-size:15px;line-height:1.6
}
.sp-seller,.sp-seller *{box-sizing:border-box}
.sp-seller h2,.sp-seller h3,.sp-seller p,.sp-seller dl,.sp-seller dd{margin:0}
.sp-seller button,.sp-seller input,.sp-seller select{font:inherit}
.sp-seller button{cursor:pointer}
.sp-seller button:focus-visible,.sp-seller input:focus-visible,.sp-seller select:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.sg-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

.sg-header{display:flex;align-items:center;gap:16px}
.sg-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--sg-soft);color:#6a8338;border:1px solid #dce6cb}
.sg-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.sg-header h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px;line-height:1.3}
.sg-header p{color:var(--sg-muted);font-size:15px;margin-top:2px}

.sg-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px;background:#fff;border:1px solid var(--sg-line);border-radius:16px}
.sg-list-label{font-size:16px;font-weight:650;white-space:nowrap}
.sg-count{display:block;font-size:14px;font-weight:400;color:var(--sg-muted);margin-top:2px}
.sg-controls{display:flex;align-items:center;gap:12px;min-width:0}
.sg-search{position:relative;width:300px;max-width:100%;display:flex;align-items:center}
.sg-search-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.sg-search input{width:100%;min-width:0;height:46px;background:var(--sg-bg);color:var(--sg-ink);border:1px solid #d9e1cf;border-radius:12px;padding:0 40px 0 42px;font-size:15px}
.sg-search input::placeholder{color:#6b7861}
.sg-search input:hover{border-color:#c5d1b6}
.sg-clear{position:absolute;right:6px;background:none;border:0;border-radius:8px;width:32px;height:32px;display:grid;place-items:center;color:#5f6e53}
.sg-clear:hover{background:#e8efdd}
.sg-filter{position:relative;display:flex;align-items:center;flex-shrink:0}
.sg-filter-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.sg-filter-chevron{position:absolute;right:14px;color:#6f8062;pointer-events:none}
.sg-filter select{appearance:none;height:46px;width:230px;border:1px solid #d9e1cf;background:#fff;border-radius:12px;color:var(--sg-text);padding:0 38px 0 40px;font-size:15px;font-weight:500}
.sg-filter select:hover{border-color:#c5d1b6}

.sg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}
.sg-card{min-width:0;border:1px solid var(--sg-line);background:#fff;border-radius:10px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.sg-card:hover{border-color:#d3dcc4;box-shadow:0 3px 10px rgba(40,53,41,.06)}
.sg-card-body{padding:12px}
.sg-card-top{display:flex;align-items:flex-start;gap:10px}
.sg-photo{width:44px;height:44px;border-radius:9px;object-fit:cover;border:1px solid var(--sg-line);flex-shrink:0;background:var(--sg-bg)}
.sg-card-title{min-width:0;flex:1}
.sg-card h3{font-size:12px;font-weight:700;letter-spacing:-.1px;line-height:1.4;overflow-wrap:anywhere}
.sg-category{font-size:11px;color:var(--sg-muted);margin-top:1px!important;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.sg-status{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600;line-height:1.4;margin-top:5px;background:#f2f4ed;color:#53624a;max-width:100%}
.sg-status svg{flex-shrink:0;width:10px;height:10px}
.sg-status-verified{background:#e9f2de;color:#47651f}
.sg-status-pending{background:#fff3dc;color:#7a5614}
.sg-status-suspended{background:#f8e9e2;color:#8a4a33}
.sg-status-rejected{background:#eceee8;color:#4f5a47}

.sg-facts{display:grid;gap:5px;margin-top:10px!important}
.sg-fact{display:flex;align-items:center;gap:6px;background:var(--sg-bg);border-radius:7px;padding:5px 8px;min-width:0}
.sg-fact svg{color:#6f8a3d;flex-shrink:0;width:11px;height:11px}
.sg-fact dt{font-size:10px;color:var(--sg-muted);line-height:1.3}
.sg-fact dd{font-size:11px;font-weight:600;color:var(--sg-ink);line-height:1.3;margin-top:0!important;overflow-wrap:anywhere}
.sg-legal{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px}
.sg-legal-item{background:var(--sg-soft);border-radius:7px;padding:5px 8px;min-width:0}
.sg-legal-item dt{font-size:10px;color:#4b6329;font-weight:600}
.sg-legal-item dd{font-family:'SFMono-Regular',Consolas,monospace;font-size:10px;font-weight:600;color:#33481a;margin-top:1px!important;overflow-wrap:anywhere}

.sg-actions{padding:7px 12px;border-top:1px solid #edf0e7;background:#fbfcf8;display:flex;gap:6px}
.sg-primary{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:28px;border-radius:7px;border:1px solid var(--sg-green);background:var(--sg-green);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;transition:background .18s}
.sg-primary:hover{background:var(--sg-green-dark);border-color:var(--sg-green-dark)}
.sg-btn-danger{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:28px;border-radius:7px;border:1px solid #e3c5b8;background:#fff;color:#8a4a33;font-size:11px;font-weight:600;padding:4px 10px;transition:background .18s}
.sg-btn-danger:hover{background:#fbe6e0}
.sg-btn-restore{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:28px;border-radius:7px;border:1px solid #d9e4c9;background:#f2f6eb;color:#66803c;font-size:11px;font-weight:600;padding:4px 10px;transition:background .18s}
.sg-btn-restore:hover{background:#e6eed9}

.sg-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:18px;text-align:center;padding:56px 24px}
.sg-empty-icon{width:56px;height:56px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--sg-soft);color:#6a8338}
.sg-empty h3{font-size:20px;margin-bottom:6px}
.sg-empty p{font-size:15px;color:var(--sg-muted)}
.sg-reset{margin-top:20px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:12px;padding:10px 20px;min-height:44px;font-size:15px;font-weight:600}
.sg-reset:hover{background:#e6eed9}

.sg-pagination{display:flex;align-items:center;justify-content:center;gap:8px}
.sg-page-btn{display:inline-flex;align-items:center;justify-content:center;w-9:width:36px;height:36px;width:36px;border-radius:9px;border:1px solid #d9e1cf;background:#fff;color:var(--sg-text);font-size:13px;font-weight:600;transition:background .15s}
.sg-page-btn:hover:not(:disabled){background:var(--sg-soft)}
.sg-page-btn:disabled{opacity:.4;cursor:not-allowed}
.sg-page-info{font-size:13px;color:var(--sg-muted)}

.sg-modal-backdrop{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px}
.sg-modal{background:#fff;border-radius:20px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto}
.sg-modal-title{font-size:16px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.sg-modal-row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #f0f2ed;font-size:13px}
.sg-modal-row:last-of-type{border-bottom:0}
.sg-modal-label{color:var(--sg-muted)}
.sg-modal-value{font-weight:600;color:var(--sg-ink);text-align:right;overflow-wrap:anywhere;max-width:60%}
.sg-modal-textarea{width:100%;min-height:80px;border:1px solid #d9e1cf;border-radius:10px;padding:10px;font-size:13px;resize:vertical;margin-top:8px;background:var(--sg-bg)}
.sg-modal-textarea:focus{outline:none;border-color:#8da249}
.sg-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:16px;border-top:1px solid #f0f2ed}

@media(max-width:1100px){.sg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sg-toolbar{align-items:stretch;flex-direction:column}.sg-controls{width:100%}.sg-search{flex:1;width:auto}}
@media(max-width:600px){.sp-seller{gap:16px}.sg-header{gap:10px}.sg-header-icon{width:40px;height:40px;border-radius:12px}.sg-header h2{font-size:20px}.sg-header p{font-size:13px}.sg-toolbar{padding:12px}.sg-controls{flex-direction:column;align-items:stretch}.sg-search{width:100%;flex:auto}.sg-filter select{width:100%}.sg-grid{grid-template-columns:1fr}.sg-card-body{padding:10px}.sg-actions{padding:7px 10px}.sg-legal{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.sp-seller *{transition:none!important}}
`;

/* ─── Status helpers ─────────────────────────────────────────────────────── */
const statusConfig = (status: AdminMerchant['verificationStatus'], suspended: boolean) => {
  if (suspended) return { cls: 'sg-status-suspended', Icon: Ban, label: 'Dibekukan' };
  switch (status) {
    case 'verified': return { cls: 'sg-status-verified', Icon: CheckCircle2, label: 'Terverifikasi' };
    case 'pending_review': return { cls: 'sg-status-pending', Icon: Clock, label: 'Menunggu verifikasi' };
    default: return { cls: 'sg-status-rejected', Icon: AlertCircle, label: 'Perlu perbaikan' };
  }
};

/* ─── Verification Modal ─────────────────────────────────────────────────── */
interface VerifyModalProps {
  merchant: AdminMerchant;
  onClose: () => void;
  onApprove: (code: string, note: string) => Promise<void>;
  onReject: (code: string, note: string) => Promise<void>;
  onSuspend: (code: string, reason: string) => Promise<void>;
  onReinstate: (code: string) => Promise<void>;
}

const VerifyModal: React.FC<VerifyModalProps> = ({ merchant, onClose, onApprove, onReject, onSuspend, onReinstate }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const isSuspended = !!merchant.suspendedReason;

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); onClose(); } finally { setLoading(false); }
  };

  return (
    <div className="sg-modal-backdrop" onClick={onClose}>
      <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sg-modal-title">
          <FileCheck2 size={18} style={{ color: '#6a8338' }} />
          Verifikasi Legalitas & KYB Mitra
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 0, cursor: 'pointer', color: '#888' }}>
            <X size={18} />
          </button>
        </div>

        <div className="sg-modal-row"><span className="sg-modal-label">Nama Toko</span><span className="sg-modal-value">{merchant.businessName}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">Pemilik</span><span className="sg-modal-value">{merchant.ownerName}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">Telp</span><span className="sg-modal-value">{merchant.ownerPhone}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">Lokasi</span><span className="sg-modal-value">Kec. {merchant.district}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">NIB</span><span className="sg-modal-value" style={{ fontFamily: 'monospace' }}>{merchant.nibNumber || '—'}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">Halal / PIRT</span><span className="sg-modal-value" style={{ fontFamily: 'monospace' }}>{merchant.halalOrPirtNumber || '—'}</span></div>
        <div className="sg-modal-row"><span className="sg-modal-label">KTP (masked)</span><span className="sg-modal-value" style={{ fontFamily: 'monospace' }}>{merchant.ktpMasked || '—'}</span></div>
        <div className="sg-modal-row">
          <span className="sg-modal-label">Deklarasi Higienitas</span>
          <span className="sg-modal-value" style={{ color: merchant.hygieneCommitmentSigned ? '#47651f' : '#8a4a33' }}>
            {merchant.hygieneCommitmentSigned ? '✓ Bertandatangan Digital' : 'Belum'}
          </span>
        </div>

        {!isSuspended && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5b6855' }}>Catatan Admin (opsional):</label>
            <textarea
              className="sg-modal-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan untuk mitra..."
            />
          </div>
        )}

        <div className="sg-modal-actions">
          {isSuspended ? (
            <button
              type="button"
              className="sg-btn-restore"
              disabled={loading}
              onClick={() => run(() => onReinstate(merchant.id))}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : null}
              Aktifkan Kembali
            </button>
          ) : (
            <>
              {merchant.verificationStatus !== 'rejected' && (
                <button
                  type="button"
                  className="sg-btn-danger"
                  disabled={loading}
                  onClick={() => run(() => onSuspend(merchant.id, note || 'Dibekukan oleh Admin'))}
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                  Bekukan Toko
                </button>
              )}
              <button
                type="button"
                className="sg-btn-danger"
                disabled={loading}
                onClick={() => run(() => onReject(merchant.id, note || 'Dokumen belum lengkap.'))}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                Tolak
              </button>
              <button
                type="button"
                className="sg-primary"
                disabled={loading}
                onClick={() => run(() => onApprove(merchant.id, note || 'Semua berkas legalitas disetujui.'))}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                Setujui Mitra
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Merchant Card ──────────────────────────────────────────────────────── */
const MerchantCard: React.FC<{ merchant: AdminMerchant; onSelect: (m: AdminMerchant) => void }> = ({ merchant, onSelect }) => {
  const headingId = useId();
  const isSuspended = !!merchant.suspendedReason;
  const { cls, Icon, label } = statusConfig(merchant.verificationStatus, isSuspended);

  return (
    <article className="sg-card" aria-labelledby={headingId}>
      <div className="sg-card-body">
        <div className="sg-card-top">
          <ResilientImage
            src={merchant.businessPhoto ?? ''}
            alt={merchant.businessName}
            className="sg-photo"
          />
          <div className="sg-card-title">
            <h3 id={headingId}>{merchant.businessName}</h3>
            <p className="sg-category">{merchant.businessCategory}</p>
            <span className={`sg-status ${cls}`}><Icon size={10} aria-hidden="true" />{label}</span>
          </div>
        </div>

        <dl className="sg-facts">
          <div className="sg-fact">
            <User size={11} aria-hidden="true" />
            <div><dt>Pemilik</dt><dd>{merchant.ownerName}</dd></div>
          </div>
          <div className="sg-fact">
            <Phone size={11} aria-hidden="true" />
            <div><dt>Kontak</dt><dd>{merchant.ownerPhone}</dd></div>
          </div>
          <div className="sg-fact">
            <MapPin size={11} aria-hidden="true" />
            <div><dt>Lokasi</dt><dd>Kec. {merchant.district}</dd></div>
          </div>
        </dl>

        <dl className="sg-legal">
          <div className="sg-legal-item"><dt>NIB</dt><dd>{merchant.nibNumber || '—'}</dd></div>
          <div className="sg-legal-item"><dt>Halal/PIRT</dt><dd>{merchant.halalOrPirtNumber || '—'}</dd></div>
        </dl>
      </div>

      <div className="sg-actions">
        <button
          type="button"
          className="sg-primary"
          onClick={() => onSelect(merchant)}
          aria-label={`Tinjau legalitas ${merchant.businessName}`}
        >
          <Eye size={11} aria-hidden="true" />Tinjau legalitas
        </button>
      </div>
    </article>
  );
};

/* ─── Main Tab ───────────────────────────────────────────────────────────── */
export const SellerGovernanceTab: React.FC<SellerGovernanceTabProps> = ({ onSwitchToSellerPortal }) => {
  const searchId = useId();
  const filterId = useId();

  const [statusFilter, setStatusFilter] = useState<MerchantStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMerchant, setSelectedMerchant] = useState<AdminMerchant | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(searchQuery); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { merchants, loading, error, totalPages, total, reload, verify, suspend, reinstate } =
    useAdminMerchants(statusFilter, debouncedQuery, page);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = useCallback(async (code: string, note: string) => {
    await verify(code, 'verified', note);
    showToast('Mitra berhasil diverifikasi.');
  }, [verify]);

  const handleReject = useCallback(async (code: string, note: string) => {
    await verify(code, 'rejected', note);
    showToast('Verifikasi ditolak.');
  }, [verify]);

  const handleSuspend = useCallback(async (code: string, reason: string) => {
    await suspend(code, reason);
    showToast('Toko dibekukan.');
  }, [suspend]);

  const handleReinstate = useCallback(async (code: string) => {
    await reinstate(code);
    showToast('Toko diaktifkan kembali.');
  }, [reinstate]);

  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  return (
    <div className="sp-seller">
      <style>{styles}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, background: '#1F281A', color: '#fff', padding: '12px 18px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {/* Modal */}
      {selectedMerchant && (
        <VerifyModal
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onReinstate={handleReinstate}
        />
      )}

      {/* Header */}
      <header className="sg-header">
        <div className="sg-header-icon" aria-hidden="true"><FileCheck2 size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="sg-eyebrow">SisaPiring · Mitra UMKM</div>
          <h2>Tata kelola mitra</h2>
          <p>Periksa kelengkapan izin usaha dan atur status toko mitra.</p>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #d9e1cf', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#5b6855', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
          title="Muat ulang"
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Toolbar */}
      <div className="sg-toolbar">
        <div className="sg-list-label">
          Daftar mitra
          <span className="sg-count" role="status">
            {loading ? 'Memuat...' : `${total.toLocaleString('id-ID')} mitra`}
          </span>
        </div>
        <div className="sg-controls">
          <div className="sg-search">
            <label htmlFor={searchId} className="sg-sr-only">Cari toko, NIB, atau pemilik</label>
            <Search size={18} className="sg-search-icon" aria-hidden="true" />
            <input
              id={searchId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari toko, NIB, pemilik…"
            />
            {searchQuery && (
              <button type="button" className="sg-clear" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="sg-filter">
            <label htmlFor={filterId} className="sg-sr-only">Filter status</label>
            <SlidersHorizontal size={16} className="sg-filter-icon" aria-hidden="true" />
            <select
              id={filterId}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as MerchantStatusFilter); setPage(1); }}
            >
              <option value="all">Semua status</option>
              <option value="pending_review">Menunggu verifikasi</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Perlu perbaikan</option>
            </select>
            <ChevronDown size={16} className="sg-filter-chevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#5b6855' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: 15 }}>Memuat data mitra…</span>
        </div>
      ) : error ? (
        <div className="sg-empty">
          <div className="sg-empty-icon"><AlertCircle size={24} /></div>
          <h3>Gagal memuat data</h3>
          <p>{error}</p>
          <button type="button" className="sg-reset" onClick={() => reload()}>Coba lagi</button>
        </div>
      ) : merchants.length > 0 ? (
        <>
          <div className="sg-grid">
            {merchants.map((m) => (
              <MerchantCard key={m.id} merchant={m} onSelect={setSelectedMerchant} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sg-pagination">
              <button
                type="button"
                className="sg-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="sg-page-info">Halaman {page} dari {totalPages}</span>
              <button
                type="button"
                className="sg-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="sg-empty">
          <div className="sg-empty-icon"><Store size={24} /></div>
          <h3>{hasFilters ? 'Mitra tidak ditemukan' : 'Belum ada mitra'}</h3>
          <p>{hasFilters ? 'Coba kata kunci lain atau ubah filter.' : 'Mitra UMKM yang mendaftar akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" className="sg-reset" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
              Reset filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};
