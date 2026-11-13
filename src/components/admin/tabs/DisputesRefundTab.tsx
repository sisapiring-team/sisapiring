import React, { useId } from 'react';
import {
  Search, MessageSquare, ChevronDown, SlidersHorizontal, X,
  ArrowUpRight, CheckCircle2, Clock, Ban, AlertTriangle, Store, User,
} from 'lucide-react';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import type { AdminDisputeRecord, DisputeStatus } from '../../../data/adminData';

interface DisputesRefundTabProps {
  displayDisputes: AdminDisputeRecord[];
  disputeStatusFilter: 'all' | DisputeStatus;
  onStatusFilterChange: (status: 'all' | DisputeStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDispute: (dispute: AdminDisputeRecord) => void;
  onRejectDispute: (dispute: AdminDisputeRecord) => void;
}

const styles = `
.sp-disputes{
  --dr-ink:#283529;
  --dr-text:#44513f;
  --dr-muted:#5b6855;
  --dr-line:#e3e9db;
  --dr-bg:#f6f8f2;
  --dr-green:#69823c;
  --dr-green-dark:#556d2f;
  --dr-green-soft:#edf2e4;
  font-family:inherit;color:var(--dr-ink);display:grid;gap:24px;max-width:1280px;margin:0 auto;font-size:15px;line-height:1.6
}
.sp-disputes,.sp-disputes *{box-sizing:border-box}
.sp-disputes h2,.sp-disputes h3,.sp-disputes p,.sp-disputes dl,.sp-disputes dd{margin:0}
.sp-disputes button,.sp-disputes input,.sp-disputes select{font:inherit}
.sp-disputes button,.sp-disputes summary{cursor:pointer}
.sp-disputes button:focus-visible,.sp-disputes input:focus-visible,.sp-disputes select:focus-visible,.sp-disputes summary:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.dr-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* Header */
.dr-header{display:flex;align-items:center;gap:16px}
.dr-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--dr-green-soft);color:#6a8338;border:1px solid #dce6cb}
.dr-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.dr-header h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px;line-height:1.3}
.dr-header p{color:var(--dr-muted);font-size:15px;margin-top:2px}

/* Toolbar */
.dr-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px;background:#fff;border:1px solid var(--dr-line);border-radius:16px}
.dr-list-label{font-size:16px;font-weight:650;white-space:nowrap}
.dr-count{display:block;font-size:14px;font-weight:400;color:var(--dr-muted);margin-top:2px}
.dr-controls{display:flex;align-items:center;gap:12px;min-width:0}
.dr-search{position:relative;width:300px;max-width:100%;display:flex;align-items:center}
.dr-search-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.dr-search input{width:100%;min-width:0;height:46px;background:var(--dr-bg);color:var(--dr-ink);border:1px solid #d9e1cf;border-radius:12px;padding:0 40px 0 42px;font-size:15px}
.dr-search input::placeholder{color:#6b7861}
.dr-search input:hover{border-color:#c5d1b6}
.dr-clear{position:absolute;right:6px;background:none;border:0;border-radius:8px;width:32px;height:32px;display:grid;place-items:center;color:#5f6e53}
.dr-clear:hover{background:#e8efdd}
.dr-filter{position:relative;display:flex;align-items:center;flex-shrink:0}
.dr-filter-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.dr-filter-chevron{position:absolute;right:14px;color:#6f8062;pointer-events:none}
.dr-filter select{appearance:none;height:46px;width:220px;border:1px solid #d9e1cf;background:#fff;border-radius:12px;color:var(--dr-text);padding:0 38px 0 40px;font-size:15px;font-weight:500}
.dr-filter select:hover{border-color:#c5d1b6}

/* Grid & card */
.dr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}
.dr-card{min-width:0;border:1px solid var(--dr-line);background:#fff;border-radius:18px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.dr-card:hover{border-color:#d3dcc4;box-shadow:0 6px 20px rgba(40,53,41,.06)}
.dr-card-body{padding:24px 24px 20px}
.dr-card-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px}
.dr-ticket{font-family:'SFMono-Regular',Consolas,monospace;font-size:13px;font-weight:600;color:var(--dr-muted);background:var(--dr-bg);border:1px solid var(--dr-line);border-radius:8px;padding:4px 10px;overflow-wrap:anywhere;min-width:0}
.dr-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600;line-height:1.4;background:#f2f4ed;color:#53624a;max-width:100%}
.dr-status svg{flex-shrink:0}
.dr-status-review{background:#fff3dc;color:#7a5614}
.dr-status-investigate{background:#eaeefa;color:#4e5b86}
.dr-status-refund{background:#e9f2de;color:#47651f}
.dr-status-rejected{background:#f8e9e2;color:#8a4a33}
.dr-card h3{font-size:19px;font-weight:700;letter-spacing:-.2px;line-height:1.4;overflow-wrap:anywhere}
.dr-item{font-size:15px;color:var(--dr-muted);margin-top:4px!important;overflow-wrap:anywhere}
.dr-severity{display:inline-flex;align-items:center;gap:6px;margin-top:12px;border-radius:8px;background:#f8f0dc;color:#7a5c1c;padding:4px 10px;font-size:13px;font-weight:600;max-width:100%;overflow-wrap:anywhere}
.dr-severity-critical{background:#fae6df;color:#8d4630}
.dr-severity svg{flex-shrink:0}
.dr-description{font-size:15px;color:var(--dr-text);line-height:1.7;margin-top:14px!important;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}

/* Facts */
.dr-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px!important}
.dr-fact{display:flex;align-items:flex-start;gap:10px;background:var(--dr-bg);border-radius:12px;padding:12px 14px;min-width:0}
.dr-fact svg{color:#6f8a3d;flex-shrink:0;margin-top:3px}
.dr-fact dt{font-size:13px;color:var(--dr-muted);line-height:1.4}
.dr-fact dd{font-size:15px;font-weight:600;color:var(--dr-ink);line-height:1.4;margin-top:2px!important;overflow-wrap:anywhere}
.dr-amount-fact{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--dr-green-soft);border-radius:12px;padding:14px 16px}
.dr-amount-fact dt{font-size:14px;font-weight:600;color:#4b6329}
.dr-amount{font-size:18px;font-weight:700;color:#3f5a1f;font-variant-numeric:tabular-nums;text-align:right}

/* Details */
.dr-details{margin-top:16px}
.dr-details summary{list-style:none;display:flex;align-items:center;gap:6px;width:fit-content;font-size:14px;color:#55702f;font-weight:600;border-radius:8px;padding:6px 4px}
.dr-details summary::-webkit-details-marker{display:none}
.dr-details summary:hover{color:#354e1e}
.dr-details summary svg{transition:transform .18s;flex-shrink:0}
.dr-details[open] summary svg{transform:rotate(180deg)}
.dr-details-close{display:none}.dr-details[open] .dr-details-open{display:none}.dr-details[open] .dr-details-close{display:inline}
.dr-detail-content{margin-top:10px;background:var(--dr-bg);border:1px solid var(--dr-line);border-radius:12px;padding:16px;color:var(--dr-text);font-size:15px;line-height:1.7}
.dr-detail-content dl{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.dr-detail-content dt{font-size:13px;color:var(--dr-muted);margin-bottom:2px}
.dr-detail-content dd{overflow-wrap:anywhere;font-weight:600;color:var(--dr-ink)}
.dr-full-description{border-top:1px solid #e1e8d6;padding-top:14px;white-space:pre-wrap;overflow-wrap:anywhere}
.dr-full-label{display:block;font-size:13px;color:var(--dr-muted);margin-bottom:4px}

/* Actions */
.dr-actions{padding:16px 24px;border-top:1px solid #edf0e7;background:#fbfcf8;display:flex;align-items:center;gap:12px}
.dr-primary,.dr-reject{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border-radius:12px;font-size:15px;font-weight:600;padding:10px 18px;transition:background .18s,color .18s,border-color .18s}
.dr-primary{flex:1;border:1px solid var(--dr-green);background:var(--dr-green);color:#fff}
.dr-primary:hover{background:var(--dr-green-dark);border-color:var(--dr-green-dark)}
.dr-reject{border:1px solid #d9dfd0;background:#fff;color:#5f6a55;min-width:88px}
.dr-reject:hover{background:#f8ebe5;color:#8a4a33;border-color:#e3c5b8}

/* Resolution */
.dr-resolution{padding:16px 24px 20px;border-top:1px solid #edf0e7;background:#f6faf0;font-size:15px;color:#47602f;line-height:1.7;overflow-wrap:anywhere}
.dr-resolution-rejected{background:#fcf6f2;color:#7a4b38}
.dr-resolution-label{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:650;margin-bottom:4px}
.dr-resolution p{white-space:pre-wrap}

/* Empty */
.dr-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:18px;text-align:center;padding:56px 24px}
.dr-empty-icon{width:56px;height:56px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--dr-green-soft);color:#6a8338}
.dr-empty h3{font-size:20px;margin-bottom:6px}
.dr-empty p{font-size:15px;color:var(--dr-muted)}
.dr-reset{margin-top:20px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:12px;padding:10px 20px;min-height:44px;font-size:15px;font-weight:600}
.dr-reset:hover{background:#e6eed9}

@media(max-width:1100px){
  .dr-grid{grid-template-columns:1fr}
  .dr-toolbar{align-items:stretch;flex-direction:column}
  .dr-controls{width:100%}
  .dr-search{flex:1;width:auto}
}
@media(max-width:600px){
  .sp-disputes{gap:20px}
  .dr-header{gap:12px}
  .dr-header-icon{width:46px;height:46px;border-radius:14px}
  .dr-header h2{font-size:24px}
  .dr-header p{font-size:14px}
  .dr-toolbar{padding:16px}
  .dr-controls{flex-direction:column;align-items:stretch}
  .dr-search{width:100%;flex:auto}
  .dr-filter select{width:100%}
  .dr-card-body{padding:20px 18px 16px}
  .dr-card h3{font-size:18px}
  .dr-facts{grid-template-columns:1fr}
  .dr-detail-content dl{grid-template-columns:1fr}
  .dr-actions,.dr-resolution{padding-left:18px;padding-right:18px}
}
@media(max-width:360px){
  .dr-amount-fact{align-items:flex-start;flex-direction:column;gap:4px}
  .dr-amount{text-align:left}
  .dr-actions{flex-wrap:wrap}
  .dr-primary,.dr-reject{width:100%;flex:auto}
}
@media(prefers-reduced-motion:reduce){.sp-disputes *{transition:none!important}}
`;

const statusLabels: Record<DisputeStatus, string> = {
  'Sedang Ditinjau': 'Ditinjau',
  'Investigasi Mitra': 'Investigasi mitra',
  'Selesai (Refund Pembeli)': 'Refund selesai',
  'Selesai (Sanksi UMKM)': 'Sanksi UMKM',
  'Ditolak (Bukti Tidak Valid)': 'Ditolak',
};

const DisputeCard = ({
  dispute, onSelectDispute, onRejectDispute,
}: Pick<DisputesRefundTabProps, 'onSelectDispute' | 'onRejectDispute'> & { dispute: AdminDisputeRecord }) => {
  const headingId = useId();
  const isReview = dispute.status === 'Sedang Ditinjau';
  const isInvestigation = dispute.status === 'Investigasi Mitra';
  const isPending = isReview || isInvestigation;
  const isRefund = dispute.status === 'Selesai (Refund Pembeli)';
  const isSanksi = dispute.status === 'Selesai (Sanksi UMKM)';
  const isRejected = dispute.status === 'Ditolak (Bukti Tidak Valid)';
  const statusClass = isReview
    ? 'dr-status-review'
    : isInvestigation
      ? 'dr-status-investigate'
      : isRefund
        ? 'dr-status-refund'
        : isSanksi || isRejected
          ? 'dr-status-rejected'
          : '';
  const StatusIcon = isRefund ? CheckCircle2 : isRejected || isSanksi ? Ban : Clock;

  return (
    <article className="dr-card" aria-labelledby={headingId}>
      <div className="dr-card-body">
        <div className="dr-card-meta">
          <span className="dr-ticket">#{dispute.ticketCode}</span>
          <span className={`dr-status ${statusClass}`}>
            <StatusIcon size={15} aria-hidden="true" />
            {statusLabels[dispute.status] ?? dispute.status}
          </span>
        </div>

        <h3 id={headingId}>{dispute.category}</h3>
        <p className="dr-item">{dispute.itemName}</p>

        {dispute.severity && (
          <span className={`dr-severity ${dispute.severity.includes('Kritis') ? 'dr-severity-critical' : ''}`}>
            <AlertTriangle size={14} aria-hidden="true" />
            {dispute.severity}
          </span>
        )}

        <p className="dr-description">{dispute.description}</p>

        <dl className="dr-facts">
          <div className="dr-fact">
            <User size={16} aria-hidden="true" />
            <div><dt>Pembeli</dt><dd>{dispute.reporterName}</dd></div>
          </div>
          <div className="dr-fact">
            <Store size={16} aria-hidden="true" />
            <div><dt>Mitra</dt><dd>{dispute.merchantName}</dd></div>
          </div>
          <div className="dr-amount-fact">
            <dt>Nilai transaksi</dt>
            <dd className="dr-amount">{formatRupiah(dispute.amountPaid)}</dd>
          </div>
        </dl>

        <details className="dr-details">
          <summary>
            <span className="dr-details-open">Lihat detail</span>
            <span className="dr-details-close">Tutup detail</span>
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <div className="dr-detail-content">
            <dl>
              <div><dt>Pesanan</dt><dd>{dispute.orderCode}</dd></div>
              <div><dt>Telepon pembeli</dt><dd>{dispute.reporterPhone || 'Tidak tersedia'}</dd></div>
            </dl>
            <div className="dr-full-description">
              <span className="dr-full-label">Komplain lengkap</span>
              {dispute.description}
            </div>
          </div>
        </details>
      </div>

      {isPending ? (
        <div className="dr-actions">
          <button type="button" className="dr-primary" aria-label={`Tinjau komplain ${dispute.ticketCode}`} onClick={() => onSelectDispute(dispute)}>
            Tinjau komplain<ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <button type="button" className="dr-reject" aria-label={`Tolak komplain ${dispute.ticketCode}`} onClick={() => onRejectDispute(dispute)}>
            Tolak
          </button>
        </div>
      ) : (
        <div className={`dr-resolution ${isRejected ? 'dr-resolution-rejected' : ''}`}>
          <div className="dr-resolution-label">
            <StatusIcon size={15} aria-hidden="true" />
            {isRejected ? 'Catatan penolakan' : 'Catatan penyelesaian'}
          </div>
          <p>{dispute.adminResolutionNote || 'Belum ada catatan.'}</p>
        </div>
      )}
    </article>
  );
};

export const DisputesRefundTab: React.FC<DisputesRefundTabProps> = ({
  displayDisputes, disputeStatusFilter, onStatusFilterChange,
  searchQuery, onSearchChange, onSelectDispute, onRejectDispute,
}) => {
  const searchId = useId();
  const filterId = useId();
  const hasFilters = searchQuery.trim().length > 0 || disputeStatusFilter !== 'all';

  const changeStatus = (value: string) => {
    if (value === 'all' || value === 'Sedang Ditinjau' || value === 'Investigasi Mitra' || value === 'Selesai (Refund Pembeli)' || value === 'Ditolak (Bukti Tidak Valid)') {
      onStatusFilterChange(value);
    }
  };

  return (
    <div className="sp-disputes">
      <style>{styles}</style>

      <header className="dr-header">
        <div className="dr-header-icon" aria-hidden="true"><MessageSquare size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="dr-eyebrow">SisaPiring · Komplain</div>
          <h2>Komplain & refund</h2>
          <p>Tinjau laporan pembeli dan tentukan solusinya.</p>
        </div>
      </header>

      <div className="dr-toolbar">
        <div className="dr-list-label">
          Daftar komplain
          <span className="dr-count" role="status">{displayDisputes.length.toLocaleString('id-ID')} tiket ditampilkan</span>
        </div>
        <div className="dr-controls">
          <div className="dr-search">
            <label htmlFor={searchId} className="dr-sr-only">Cari tiket, nama, atau masalah</label>
            <Search size={18} className="dr-search-icon" aria-hidden="true" />
            <input id={searchId} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari tiket atau pembeli…" />
            {searchQuery && (
              <button type="button" className="dr-clear" aria-label="Hapus pencarian" onClick={() => onSearchChange('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="dr-filter">
            <label htmlFor={filterId} className="dr-sr-only">Filter status komplain</label>
            <SlidersHorizontal size={16} className="dr-filter-icon" aria-hidden="true" />
            <select id={filterId} value={disputeStatusFilter} onChange={(e) => changeStatus(e.target.value)}>
              <option value="all">Semua status</option>
              <option value="Sedang Ditinjau">Ditinjau</option>
              <option value="Investigasi Mitra">Investigasi mitra</option>
              <option value="Selesai (Refund Pembeli)">Refund selesai</option>
              <option value="Ditolak (Bukti Tidak Valid)">Ditolak</option>
            </select>
            <ChevronDown size={16} className="dr-filter-chevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {displayDisputes.length > 0 ? (
        <div className="dr-grid">
          {displayDisputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} onSelectDispute={onSelectDispute} onRejectDispute={onRejectDispute} />
          ))}
        </div>
      ) : (
        <div className="dr-empty">
          <div className="dr-empty-icon" aria-hidden="true">{hasFilters ? <Search size={24} /> : <MessageSquare size={24} />}</div>
          <h3>{hasFilters ? 'Komplain tidak ditemukan' : 'Belum ada komplain'}</h3>
          <p>{hasFilters ? 'Coba kata kunci lain atau ubah filter.' : 'Laporan pembeli akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" className="dr-reset" onClick={() => { onSearchChange(''); onStatusFilterChange('all'); }}>
              Reset filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};