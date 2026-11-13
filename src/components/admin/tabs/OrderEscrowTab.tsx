import React, { useId, useState } from 'react';
import {
  Search, CheckCircle2, Clock, AlertCircle, X, Wallet,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal,
  ChevronDown, Store, User, Package,
} from 'lucide-react';
import { useAdminOrders, type AdminOrder, type OrderStatusFilter } from '../../../hooks/useAdminOrders';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatRp(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const STATUS_LABELS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  pending_payment:      { label: 'Menunggu Bayar',   cls: 'oe-status-other',   Icon: Clock },
  waiting_confirmation: { label: 'Menunggu Konfirm', cls: 'oe-status-held',    Icon: Clock },
  confirmed:            { label: 'Dikonfirmasi',     cls: 'oe-status-held',    Icon: Clock },
  ready_for_pickup:     { label: 'Siap Ambil',       cls: 'oe-status-held',    Icon: Clock },
  completed:            { label: 'Selesai',           cls: 'oe-status-settled', Icon: CheckCircle2 },
  cancelled:            { label: 'Dibatalkan',        cls: 'oe-status-other',   Icon: AlertCircle },
  expired:              { label: 'Kedaluwarsa',       cls: 'oe-status-other',   Icon: AlertCircle },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  paid:     { label: 'Lunas',     color: '#47651f' },
  pending:  { label: 'Belum Bayar', color: '#7a5614' },
  refunded: { label: 'Direfund',  color: '#8a4a33' },
  failed:   { label: 'Gagal',     color: '#8a4a33' },
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
.sp-escrow{--oe-ink:#283529;--oe-muted:#5b6855;--oe-line:#e3e9db;--oe-bg:#f6f8f2;--oe-green:#69823c;--oe-soft:#edf2e4;font-family:inherit;color:var(--oe-ink);display:grid;gap:24px;max-width:1280px;margin:0 auto}
.sp-escrow,.sp-escrow *{box-sizing:border-box}
.sp-escrow h2,.sp-escrow h3,.sp-escrow p,.sp-escrow dl,.sp-escrow dd{margin:0}
.sp-escrow button,.sp-escrow input,.sp-escrow select{font:inherit;cursor:pointer}
.sp-escrow button:focus-visible,.sp-escrow input:focus-visible,.sp-escrow select:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.oe-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

.oe-header{display:flex;align-items:center;gap:16px}
.oe-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--oe-soft);color:#6a8338;border:1px solid #dce6cb}
.oe-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.oe-header h2{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px}
.oe-header p{color:var(--oe-muted);font-size:15px;margin-top:2px;max-width:580px}

.oe-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.oe-stat{background:#fff;border:1px solid var(--oe-line);border-radius:14px;padding:18px 20px}
.oe-stat-label{font-size:12px;color:var(--oe-muted);font-weight:600;margin-bottom:6px}
.oe-stat-value{font-size:22px;font-weight:700;letter-spacing:-.3px;font-variant-numeric:tabular-nums;color:var(--oe-ink)}
.oe-stat-sub{font-size:12px;color:var(--oe-muted);margin-top:3px}

.oe-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;background:#fff;border:1px solid var(--oe-line);border-radius:16px}
.oe-list-label{font-size:16px;font-weight:650;white-space:nowrap}
.oe-count{display:block;font-size:14px;font-weight:400;color:var(--oe-muted);margin-top:2px}
.oe-controls{display:flex;align-items:center;gap:10px;min-width:0}
.oe-search{position:relative;width:280px;max-width:100%;display:flex;align-items:center}
.oe-search-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.oe-search input{width:100%;height:44px;background:var(--oe-bg);color:var(--oe-ink);border:1px solid #d9e1cf;border-radius:12px;padding:0 36px 0 42px;font-size:15px}
.oe-search input::placeholder{color:#6b7861}
.oe-clear{position:absolute;right:6px;background:none;border:0;border-radius:8px;width:30px;height:30px;display:grid;place-items:center;color:#5f6e53}
.oe-clear:hover{background:#e8efdd}
.oe-filter{position:relative;display:flex;align-items:center;flex-shrink:0}
.oe-filter-icon{position:absolute;left:12px;color:#6f8062;pointer-events:none}
.oe-filter-chevron{position:absolute;right:12px;color:#6f8062;pointer-events:none}
.oe-filter select{appearance:none;height:44px;width:210px;border:1px solid #d9e1cf;background:#fff;border-radius:12px;color:var(--oe-ink);padding:0 34px 0 36px;font-size:14px;font-weight:500}

.oe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}
.oe-card{border:1px solid var(--oe-line);background:#fff;border-radius:14px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.oe-card:hover{border-color:#cdd8bf;box-shadow:0 4px 16px rgba(40,53,41,.06)}
.oe-card-body{padding:16px 18px}
.oe-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
.oe-code{font-family:'SFMono-Regular',Consolas,monospace;font-size:13px;font-weight:700;color:var(--oe-ink)}
.oe-date{font-size:12px;color:var(--oe-muted);margin-top:2px}
.oe-status{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:600;background:#f2f4ed;color:#53624a;white-space:nowrap}
.oe-status svg{flex-shrink:0;width:11px;height:11px}
.oe-status-settled{background:#e9f2de;color:#47651f}
.oe-status-held{background:#fff3dc;color:#7a5614}
.oe-status-other{background:#f5ebe7;color:#8a4a33}

.oe-items{margin-bottom:10px}
.oe-item-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f0f2ed;font-size:13px}
.oe-item-row:last-child{border-bottom:0}
.oe-item-img{width:36px;height:36px;border-radius:7px;object-fit:cover;background:#f0f3e9;flex-shrink:0;border:1px solid #e8ecdf}
.oe-item-name{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.oe-item-qty{font-size:12px;color:var(--oe-muted);white-space:nowrap}
.oe-item-price{font-size:12px;font-weight:700;color:var(--oe-green);white-space:nowrap;font-variant-numeric:tabular-nums}

.oe-people{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.oe-person{background:var(--oe-bg);border-radius:8px;padding:8px 10px;min-width:0;display:flex;align-items:center;gap:7px}
.oe-person svg{color:#6f8a3d;flex-shrink:0;width:12px;height:12px}
.oe-person dt{font-size:10px;color:var(--oe-muted)}
.oe-person dd{font-size:12px;font-weight:600;overflow-wrap:anywhere;margin:0}

.oe-total{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--oe-soft);border-radius:9px;padding:10px 12px}
.oe-total-label{font-size:12px;font-weight:600;color:#4b6329}
.oe-pay-status{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:#fff;margin-top:2px}
.oe-total-amount{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;color:#33481a}

.oe-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:16px;text-align:center;padding:48px 24px}
.oe-empty-icon{width:48px;height:48px;margin:0 auto 14px;display:grid;place-items:center;border-radius:14px;background:var(--oe-soft);color:#6a8338}
.oe-empty h3{font-size:18px;margin-bottom:5px}
.oe-empty p{font-size:14px;color:var(--oe-muted)}
.oe-reset{margin-top:16px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:10px;padding:8px 18px;font-size:14px;font-weight:600}

.oe-pagination{display:flex;align-items:center;justify-content:center;gap:8px}
.oe-page-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;border:1px solid #d9e1cf;background:#fff;color:var(--oe-ink);font-size:13px;font-weight:600;transition:background .15s}
.oe-page-btn:hover:not(:disabled){background:var(--oe-soft)}
.oe-page-btn:disabled{opacity:.4;cursor:not-allowed}
.oe-page-info{font-size:13px;color:var(--oe-muted)}

@media(max-width:1100px){.oe-grid{grid-template-columns:1fr}.oe-stats{grid-template-columns:repeat(2,1fr)}.oe-toolbar{flex-direction:column;align-items:stretch}.oe-controls{flex-direction:column}.oe-search{width:100%}.oe-filter select{width:100%}}
@media(max-width:600px){.sp-escrow{gap:16px}.oe-header{gap:10px}.oe-stats{grid-template-columns:1fr 1fr}.oe-card-body{padding:14px 14px}.oe-people{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.sp-escrow *{transition:none!important}}
`;

/* ─── Order Card ─────────────────────────────────────────────────────────── */
const OrderCard: React.FC<{ order: AdminOrder }> = ({ order }) => {
  const { label, cls, Icon } = STATUS_LABELS[order.status] ?? { label: order.status, cls: 'oe-status-other', Icon: AlertCircle };
  const pay = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: '#5b6855' };

  return (
    <article className="oe-card">
      <div className="oe-card-body">
        {/* Top: code + status */}
        <div className="oe-card-top">
          <div>
            <span className="oe-code">{order.id}</span>
            <div className="oe-date">{order.orderDate}</div>
          </div>
          <span className={`oe-status ${cls}`}><Icon size={11} aria-hidden="true" />{label}</span>
        </div>

        {/* Items */}
        <div className="oe-items">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="oe-item-row">
              {item.image
                ? <img src={item.image} alt={item.productName} className="oe-item-img" />
                : <div className="oe-item-img" style={{ display: 'grid', placeItems: 'center' }}><Package size={16} style={{ color: '#98a58a' }} /></div>
              }
              <span className="oe-item-name" title={item.productName}>{item.productName}</span>
              <span className="oe-item-qty">×{item.quantity}</span>
              <span className="oe-item-price">{formatRp(item.subtotal)}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div style={{ fontSize: 12, color: '#5b6855', padding: '5px 0' }}>+{order.items.length - 3} item lainnya</div>
          )}
        </div>

        {/* People */}
        <dl className="oe-people">
          <div className="oe-person">
            <User size={12} aria-hidden="true" />
            <div><dt>Pembeli</dt><dd>{order.customerName}</dd></div>
          </div>
          <div className="oe-person">
            <Store size={12} aria-hidden="true" />
            <div><dt>Mitra</dt><dd>{order.merchant?.businessName ?? '—'}</dd></div>
          </div>
        </dl>

        {/* Total */}
        <div className="oe-total">
          <div className="oe-total-label">
            Total bayar
            <span className="oe-pay-status" style={{ color: pay.color }}>{pay.label}</span>
          </div>
          <span className="oe-total-amount">{formatRp(order.totalPayment)}</span>
        </div>
      </div>
    </article>
  );
};

/* ─── Main Tab ───────────────────────────────────────────────────────────── */
export const OrderEscrowTab: React.FC = () => {
  const searchId = useId();
  const filterId = useId();

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(searchQuery); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { orders, loading, error, totalPages, total, reload } =
    useAdminOrders(statusFilter, debouncedQuery, page);

  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  // Summary stats dari data yang dimuat
  const stats = React.useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed').length;
    const active = orders.filter((o) => ['waiting_confirmation', 'confirmed', 'ready_for_pickup'].includes(o.status)).length;
    const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalPayment, 0);
    const totalSaved = orders.reduce((s, o) => s + o.totalDiscount, 0);
    return { completed, active, totalRevenue, totalSaved };
  }, [orders]);

  return (
    <div className="sp-escrow">
      <style>{styles}</style>

      {/* Header */}
      <header className="oe-header">
        <div className="oe-header-icon" aria-hidden="true"><Wallet size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="oe-eyebrow">SisaPiring · Pesanan</div>
          <h2>Pesanan & Dana Escrow</h2>
          <p>Pantau semua transaksi dan status pembayaran di platform.</p>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #d9e1cf', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#5b6855', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Stats */}
      {!loading && !error && (
        <div className="oe-stats">
          <div className="oe-stat">
            <div className="oe-stat-label">Total Pesanan</div>
            <div className="oe-stat-value">{total.toLocaleString('id-ID')}</div>
            <div className="oe-stat-sub">semua status</div>
          </div>
          <div className="oe-stat">
            <div className="oe-stat-label">Selesai</div>
            <div className="oe-stat-value" style={{ color: '#47651f' }}>{stats.completed.toLocaleString('id-ID')}</div>
            <div className="oe-stat-sub">halaman ini</div>
          </div>
          <div className="oe-stat">
            <div className="oe-stat-label">Aktif / Proses</div>
            <div className="oe-stat-value" style={{ color: '#7a5614' }}>{stats.active.toLocaleString('id-ID')}</div>
            <div className="oe-stat-sub">halaman ini</div>
          </div>
          <div className="oe-stat">
            <div className="oe-stat-label">Total Diskon Hemat</div>
            <div className="oe-stat-value" style={{ fontSize: 16 }}>{formatRp(stats.totalSaved)}</div>
            <div className="oe-stat-sub">halaman ini</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="oe-toolbar">
        <div className="oe-list-label">
          Daftar pesanan
          <span className="oe-count" role="status">
            {loading ? 'Memuat...' : `${total.toLocaleString('id-ID')} pesanan`}
          </span>
        </div>
        <div className="oe-controls">
          <div className="oe-search">
            <label htmlFor={searchId} className="oe-sr-only">Cari kode pesanan atau nama pembeli</label>
            <Search size={17} className="oe-search-icon" aria-hidden="true" />
            <input
              id={searchId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau nama pembeli…"
            />
            {searchQuery && (
              <button type="button" className="oe-clear" onClick={() => setSearchQuery('')}><X size={15} /></button>
            )}
          </div>
          <div className="oe-filter">
            <label htmlFor={filterId} className="oe-sr-only">Filter status</label>
            <SlidersHorizontal size={15} className="oe-filter-icon" aria-hidden="true" />
            <select
              id={filterId}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatusFilter); setPage(1); }}
            >
              <option value="all">Semua status</option>
              <option value="pending_payment">Menunggu Bayar</option>
              <option value="waiting_confirmation">Menunggu Konfirmasi</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="ready_for_pickup">Siap Diambil</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <ChevronDown size={14} className="oe-filter-chevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#5b6855' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: 15 }}>Memuat pesanan…</span>
        </div>
      ) : error ? (
        <div className="oe-empty">
          <div className="oe-empty-icon"><AlertCircle size={22} /></div>
          <h3>Gagal memuat data</h3>
          <p>{error}</p>
          <button type="button" className="oe-reset" onClick={() => reload()}>Coba lagi</button>
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="oe-grid">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
          {totalPages > 1 && (
            <div className="oe-pagination">
              <button type="button" className="oe-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span className="oe-page-info">Halaman {page} dari {totalPages}</span>
              <button type="button" className="oe-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="oe-empty">
          <div className="oe-empty-icon"><Wallet size={22} /></div>
          <h3>{hasFilters ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}</h3>
          <p>{hasFilters ? 'Coba kata kunci atau filter lain.' : 'Pesanan dari pembeli akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" className="oe-reset" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Reset filter</button>
          )}
        </div>
      )}
    </div>
  );
};
