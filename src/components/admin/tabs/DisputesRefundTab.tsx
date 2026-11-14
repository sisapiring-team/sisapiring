import React, { useId, useState, useCallback } from 'react';
import {
  Search, MessageSquare, ChevronDown, SlidersHorizontal, X,
  ArrowUpRight, CheckCircle2, Clock, Ban, AlertTriangle, Store, User,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useAdminDisputes, type AdminDispute, type DisputeStatusFilter } from '../../../hooks/useAdminDisputes';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatRp(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const STATUS_CFG: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  open:               { label: 'Ditinjau',       cls: 'dr-status-review',      Icon: Clock },
  investigating:      { label: 'Investigasi',    cls: 'dr-status-investigate', Icon: AlertTriangle },
  resolved_refund:    { label: 'Refund Selesai', cls: 'dr-status-refund',      Icon: CheckCircle2 },
  resolved_sanction:  { label: 'Sanksi UMKM',   cls: 'dr-status-rejected',    Icon: Ban },
  rejected:           { label: 'Ditolak',        cls: 'dr-status-rejected',    Icon: Ban },
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
.sp-disputes{--dr-ink:#283529;--dr-muted:#5b6855;--dr-line:#e3e9db;--dr-bg:#f6f8f2;--dr-green:#69823c;--dr-green-dark:#556d2f;--dr-green-soft:#edf2e4;font-family:inherit;color:var(--dr-ink);display:grid;gap:24px;max-width:1280px;margin:0 auto;font-size:15px;line-height:1.6}
.sp-disputes,.sp-disputes *{box-sizing:border-box}
.sp-disputes h2,.sp-disputes h3,.sp-disputes p,.sp-disputes dl,.sp-disputes dd{margin:0}
.sp-disputes button,.sp-disputes input,.sp-disputes select{font:inherit;cursor:pointer}
.sp-disputes button:focus-visible,.sp-disputes input:focus-visible,.sp-disputes select:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.dr-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

.dr-header{display:flex;align-items:center;gap:16px}
.dr-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--dr-green-soft);color:#6a8338;border:1px solid #dce6cb}
.dr-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.dr-header h2{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px}
.dr-header p{color:var(--dr-muted);font-size:15px;margin-top:2px}

.dr-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px;background:#fff;border:1px solid var(--dr-line);border-radius:16px}
.dr-list-label{font-size:16px;font-weight:650;white-space:nowrap}
.dr-count{display:block;font-size:14px;font-weight:400;color:var(--dr-muted);margin-top:2px}
.dr-controls{display:flex;align-items:center;gap:12px;min-width:0}
.dr-search{position:relative;width:300px;max-width:100%;display:flex;align-items:center}
.dr-search-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.dr-search input{width:100%;height:46px;background:var(--dr-bg);color:var(--dr-ink);border:1px solid #d9e1cf;border-radius:12px;padding:0 40px 0 42px;font-size:15px}
.dr-search input::placeholder{color:#6b7861}
.dr-clear{position:absolute;right:6px;background:none;border:0;border-radius:8px;width:32px;height:32px;display:grid;place-items:center;color:#5f6e53}
.dr-clear:hover{background:#e8efdd}
.dr-filter{position:relative;display:flex;align-items:center;flex-shrink:0}
.dr-filter-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.dr-filter-chevron{position:absolute;right:14px;color:#6f8062;pointer-events:none}
.dr-filter select{appearance:none;height:46px;width:220px;border:1px solid #d9e1cf;background:#fff;border-radius:12px;color:var(--dr-ink);padding:0 38px 0 40px;font-size:15px;font-weight:500}

.dr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}
.dr-card{min-width:0;border:1px solid var(--dr-line);background:#fff;border-radius:10px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.dr-card:hover{border-color:#d3dcc4;box-shadow:0 3px 10px rgba(40,53,41,.06)}
.dr-card-body{padding:10px 12px 8px}
.dr-card-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:7px}
.dr-ticket{font-family:'SFMono-Regular',Consolas,monospace;font-size:10px;font-weight:600;color:var(--dr-muted);background:var(--dr-bg);border:1px solid var(--dr-line);border-radius:5px;padding:2px 6px}
.dr-status{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:600;background:#f2f4ed;color:#53624a;white-space:nowrap}
.dr-status svg{flex-shrink:0;width:10px;height:10px}
.dr-status-review{background:#fff3dc;color:#7a5614}
.dr-status-investigate{background:#eaeefa;color:#4e5b86}
.dr-status-refund{background:#e9f2de;color:#47651f}
.dr-status-rejected{background:#f8e9e2;color:#8a4a33}

.dr-card h3{font-size:12px;font-weight:700;line-height:1.4;overflow-wrap:anywhere}
.dr-item{font-size:11px;color:var(--dr-muted);margin-top:1px!important;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.dr-severity{display:inline-flex;align-items:center;gap:4px;margin-top:5px;border-radius:5px;background:#f8f0dc;color:#7a5c1c;padding:2px 6px;font-size:10px;font-weight:600}
.dr-severity svg{flex-shrink:0;width:10px;height:10px}
.dr-description{font-size:11px;color:var(--dr-muted);line-height:1.5;margin-top:5px!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.dr-facts{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:7px!important}
.dr-fact{display:flex;align-items:center;gap:5px;background:var(--dr-bg);border-radius:6px;padding:5px 8px;min-width:0}
.dr-fact svg{color:#6f8a3d;flex-shrink:0;width:11px;height:11px}
.dr-fact dt{font-size:10px;color:var(--dr-muted)}
.dr-fact dd{font-size:11px;font-weight:600;overflow-wrap:anywhere;margin:0}
.dr-amount-fact{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--dr-green-soft);border-radius:6px;padding:5px 8px}
.dr-amount-fact dt{font-size:10px;font-weight:600;color:#4b6329}
.dr-amount{font-size:12px;font-weight:700;color:#3f5a1f;font-variant-numeric:tabular-nums}

.dr-actions{padding:7px 12px;border-top:1px solid #edf0e7;background:#fbfcf8;display:flex;align-items:center;gap:6px}
.dr-primary{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:28px;border-radius:7px;border:1px solid var(--dr-green);background:var(--dr-green);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;transition:background .18s}
.dr-primary:hover{background:var(--dr-green-dark)}
.dr-reject{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:28px;border-radius:7px;border:1px solid #d9dfd0;background:#fff;color:#5f6a55;font-size:11px;font-weight:600;min-width:52px;padding:4px 8px;transition:background .18s}
.dr-reject:hover{background:#f8ebe5;color:#8a4a33;border-color:#e3c5b8}

.dr-resolution{padding:7px 12px 9px;border-top:1px solid #edf0e7;background:#f6faf0;font-size:11px;color:#47602f;line-height:1.5;overflow-wrap:anywhere}
.dr-resolution-rejected{background:#fcf6f2;color:#7a4b38}
.dr-resolution-label{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:650;margin-bottom:2px}

.dr-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:16px;text-align:center;padding:48px 24px}
.dr-empty-icon{width:48px;height:48px;margin:0 auto 14px;display:grid;place-items:center;border-radius:14px;background:var(--dr-green-soft);color:#6a8338}
.dr-empty h3{font-size:18px;margin-bottom:5px}
.dr-empty p{font-size:14px;color:var(--dr-muted)}
.dr-reset{margin-top:16px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:10px;padding:8px 18px;font-size:14px;font-weight:600}

.dr-pagination{display:flex;align-items:center;justify-content:center;gap:8px}
.dr-page-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;border:1px solid #d9e1cf;background:#fff;color:var(--dr-ink);font-size:13px;transition:background .15s}
.dr-page-btn:hover:not(:disabled){background:var(--dr-green-soft)}
.dr-page-btn:disabled{opacity:.4;cursor:not-allowed}
.dr-page-info{font-size:13px;color:var(--dr-muted)}

/* Modal */
.dr-modal-backdrop{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px}
.dr-modal{background:#fff;border-radius:18px;max-width:480px;width:100%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto}
.dr-modal-title{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.dr-modal-row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #f0f2ed;font-size:12px}
.dr-modal-row:last-of-type{border-bottom:0}
.dr-modal-label{color:var(--dr-muted)}
.dr-modal-value{font-weight:600;text-align:right;overflow-wrap:anywhere;max-width:60%}
.dr-modal-textarea{width:100%;min-height:72px;border:1px solid #d9e1cf;border-radius:9px;padding:9px;font-size:12px;resize:vertical;margin-top:7px;background:var(--dr-bg);font-family:inherit}
.dr-modal-textarea:focus{outline:none;border-color:#8da249}
.dr-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:14px;border-top:1px solid #f0f2ed;flex-wrap:wrap}
.dr-modal-actions button{min-height:34px;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;border:1px solid;transition:background .15s}

@media(max-width:1100px){.dr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dr-toolbar{flex-direction:column;align-items:stretch}.dr-controls{width:100%}.dr-search{flex:1;width:auto}}
@media(max-width:600px){.sp-disputes{gap:16px}.dr-header{gap:10px}.dr-toolbar{padding:12px}.dr-controls{flex-direction:column;align-items:stretch}.dr-search{width:100%}.dr-filter select{width:100%}.dr-grid{grid-template-columns:1fr}.dr-facts{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.sp-disputes *{transition:none!important}}
`;

/* ─── Resolution Modal ───────────────────────────────────────────────────── */
interface ResolutionModalProps {
  dispute: AdminDispute;
  onClose: () => void;
  onResolve: (id: number, status: string, note: string, refund?: number) => Promise<void>;
}

const ResolutionModal: React.FC<ResolutionModalProps> = ({ dispute, onClose, onResolve }) => {
  const [note, setNote] = useState('Refund 100% diproses dari dana escrow ke rekening pembeli.');
  const [loading, setLoading] = useState(false);

  const run = async (status: string, refund?: number) => {
    setLoading(true);
    try { await onResolve(dispute.id, status, note, refund); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="dr-modal-backdrop" onClick={onClose}>
      <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dr-modal-title">
          <AlertTriangle size={16} style={{ color: '#c08a2b' }} />
          Resolusi Tiket #{dispute.ticketCode}
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 0, color: '#888' }}>
            <X size={16} />
          </button>
        </div>

        <div className="dr-modal-row"><span className="dr-modal-label">Pelapor</span><span className="dr-modal-value">{dispute.reporter?.name ?? '—'}</span></div>
        <div className="dr-modal-row"><span className="dr-modal-label">Mitra</span><span className="dr-modal-value">{dispute.merchant?.businessName ?? '—'}</span></div>
        <div className="dr-modal-row"><span className="dr-modal-label">Kategori</span><span className="dr-modal-value">{dispute.category}</span></div>
        <div className="dr-modal-row"><span className="dr-modal-label">Nilai Transaksi</span><span className="dr-modal-value" style={{ color: '#3f5a1f', fontFamily: 'monospace' }}>{formatRp(dispute.order?.totalPayment ?? 0)}</span></div>
        <div className="dr-modal-row" style={{ borderBottom: '1px solid #f0f2ed', paddingBottom: 10 }}>
          <span className="dr-modal-label">Deskripsi</span>
          <span className="dr-modal-value" style={{ fontStyle: 'italic' }}>"{dispute.description}"</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5b6855' }}>Catatan Resolusi Admin:</label>
          <textarea
            className="dr-modal-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="dr-modal-actions">
          <button
            type="button"
            onClick={() => run('rejected', 0)}
            disabled={loading}
            style={{ background: '#fff', color: '#5f6a55', borderColor: '#d9dfd0' }}
          >
            Tolak Komplain
          </button>
          <button
            type="button"
            onClick={() => run('resolved_sanction', 0)}
            disabled={loading}
            style={{ background: '#1F281A', color: '#fff', borderColor: '#1F281A' }}
          >
            Sanksi Mitra
          </button>
          <button
            type="button"
            onClick={() => run('resolved_refund', dispute.order?.totalPayment ?? 0)}
            disabled={loading}
            style={{ background: '#47651f', color: '#fff', borderColor: '#47651f', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            Proses Refund
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Dispute Card ───────────────────────────────────────────────────────── */
const DisputeCard: React.FC<{
  dispute: AdminDispute;
  onSelect: (d: AdminDispute) => void;
  onQuickReject: (d: AdminDispute) => void;
}> = ({ dispute, onSelect, onQuickReject }) => {
  const headingId = useId();
  const cfg = STATUS_CFG[dispute.status] ?? { label: dispute.status, cls: '', Icon: AlertCircle };
  const isPending = dispute.status === 'open' || dispute.status === 'investigating';
  const isResolved = !isPending;
  const isRefund = dispute.status === 'resolved_refund';

  return (
    <article className="dr-card" aria-labelledby={headingId}>
      <div className="dr-card-body">
        <div className="dr-card-meta">
          <span className="dr-ticket">#{dispute.ticketCode}</span>
          <span className={`dr-status ${cfg.cls}`}><cfg.Icon size={10} aria-hidden="true" />{cfg.label}</span>
        </div>

        <h3 id={headingId}>{dispute.category}</h3>
        <p className="dr-item">{dispute.description}</p>

        {dispute.severity && (
          <span className="dr-severity"><AlertTriangle size={10} />{dispute.severity}</span>
        )}

        <dl className="dr-facts">
          <div className="dr-fact">
            <User size={11} aria-hidden="true" />
            <div><dt>Pembeli</dt><dd>{dispute.reporter?.name ?? '—'}</dd></div>
          </div>
          <div className="dr-fact">
            <Store size={11} aria-hidden="true" />
            <div><dt>Mitra</dt><dd>{dispute.merchant?.businessName ?? '—'}</dd></div>
          </div>
          <div className="dr-amount-fact">
            <dt>Nilai transaksi</dt>
            <dd className="dr-amount">{formatRp(dispute.order?.totalPayment ?? 0)}</dd>
          </div>
        </dl>
      </div>

      {isPending ? (
        <div className="dr-actions">
          <button
            type="button"
            className="dr-primary"
            onClick={() => onSelect(dispute)}
          >
            Tinjau<ArrowUpRight size={11} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dr-reject"
            onClick={() => onQuickReject(dispute)}
          >
            Tolak
          </button>
        </div>
      ) : (
        <div className={`dr-resolution ${!isRefund ? 'dr-resolution-rejected' : ''}`}>
          <div className="dr-resolution-label">
            <cfg.Icon size={11} aria-hidden="true" />
            {isRefund ? 'Catatan Penyelesaian' : 'Catatan Penolakan'}
          </div>
          <p style={{ fontSize: 11, margin: 0, lineHeight: 1.5 }}>{dispute.resolutionNote || 'Tidak ada catatan.'}</p>
          {dispute.refundAmount > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#47651f', marginTop: 3 }}>
              Refund: {formatRp(dispute.refundAmount)}
            </p>
          )}
        </div>
      )}
    </article>
  );
};

/* ─── Main Tab ───────────────────────────────────────────────────────────── */
export const DisputesRefundTab: React.FC = () => {
  const searchId = useId();
  const filterId = useId();

  const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(searchQuery); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { disputes, loading, error, totalPages, total, reload, resolve } =
    useAdminDisputes(statusFilter, debouncedQuery, page);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleResolve = useCallback(async (id: number, status: string, note: string, refund?: number) => {
    await resolve(id, status, note, refund);
    const labels: Record<string, string> = {
      resolved_refund: 'Refund berhasil diproses.',
      resolved_sanction: 'Sanksi mitra diterbitkan.',
      rejected: 'Komplain ditolak.',
    };
    showToast(labels[status] ?? 'Tiket diselesaikan.');
  }, [resolve]);

  const handleQuickReject = useCallback(async (dispute: AdminDispute) => {
    await resolve(dispute.id, 'rejected', 'Bukti tidak memenuhi kriteria komplain garansi mutu.', 0);
    showToast(`Tiket #${dispute.ticketCode} ditolak.`);
  }, [resolve]);

  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  return (
    <div className="sp-disputes">
      <style>{styles}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, background: '#1F281A', color: '#fff', padding: '12px 18px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {/* Modal */}
      {selectedDispute && (
        <ResolutionModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={handleResolve}
        />
      )}

      {/* Header */}
      <header className="dr-header">
        <div className="dr-header-icon" aria-hidden="true"><MessageSquare size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="dr-eyebrow">SisaPiring · Komplain</div>
          <h2>Komplain & Refund</h2>
          <p>Tinjau laporan pembeli dan tentukan resolusinya.</p>
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
      <div className="dr-toolbar">
        <div className="dr-list-label">
          Daftar komplain
          <span className="dr-count" role="status">
            {loading ? 'Memuat...' : `${total.toLocaleString('id-ID')} tiket`}
          </span>
        </div>
        <div className="dr-controls">
          <div className="dr-search">
            <label htmlFor={searchId} className="dr-sr-only">Cari tiket atau deskripsi</label>
            <Search size={18} className="dr-search-icon" aria-hidden="true" />
            <input
              id={searchId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket atau deskripsi…"
            />
            {searchQuery && (
              <button type="button" className="dr-clear" onClick={() => setSearchQuery('')}><X size={16} /></button>
            )}
          </div>
          <div className="dr-filter">
            <label htmlFor={filterId} className="dr-sr-only">Filter status komplain</label>
            <SlidersHorizontal size={16} className="dr-filter-icon" aria-hidden="true" />
            <select
              id={filterId}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as DisputeStatusFilter); setPage(1); }}
            >
              <option value="all">Semua status</option>
              <option value="open">Ditinjau</option>
              <option value="investigating">Investigasi</option>
              <option value="resolved_refund">Refund Selesai</option>
              <option value="resolved_sanction">Sanksi UMKM</option>
              <option value="rejected">Ditolak</option>
            </select>
            <ChevronDown size={16} className="dr-filter-chevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#5b6855' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: 15 }}>Memuat komplain…</span>
        </div>
      ) : error ? (
        <div className="dr-empty">
          <div className="dr-empty-icon"><AlertCircle size={22} /></div>
          <h3>Gagal memuat data</h3>
          <p>{error}</p>
          <button type="button" className="dr-reset" onClick={() => reload()}>Coba lagi</button>
        </div>
      ) : disputes.length > 0 ? (
        <>
          <div className="dr-grid">
            {disputes.map((d) => (
              <DisputeCard
                key={d.id}
                dispute={d}
                onSelect={setSelectedDispute}
                onQuickReject={handleQuickReject}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="dr-pagination">
              <button type="button" className="dr-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span className="dr-page-info">Halaman {page} dari {totalPages}</span>
              <button type="button" className="dr-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="dr-empty">
          <div className="dr-empty-icon"><MessageSquare size={22} /></div>
          <h3>{hasFilters ? 'Komplain tidak ditemukan' : 'Belum ada komplain'}</h3>
          <p>{hasFilters ? 'Coba kata kunci lain atau ubah filter.' : 'Laporan pembeli akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" className="dr-reset" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Reset filter</button>
          )}
        </div>
      )}
    </div>
  );
};
