import React, { useState, useId } from 'react';
import {
  ArrowUpRight, Download, Info, Leaf, MapPin,
  MessageSquare, ShoppingBag, Store, Utensils, ShieldCheck,
  ChevronDown, TrendingUp, Users, AlertTriangle, CheckCircle2,
  Clock, Package, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import type { AdminTab } from '../types';
import { useAdminDashboard } from '../../../hooks/useAdminDashboard';

interface OverviewTabProps {
  onSelectTab: (tab: AdminTab) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatRp(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

function fmt(n: number): string {
  return n.toLocaleString('id-ID');
}

const ORDER_STATUS_CFG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  pending_payment:      { label: 'Menunggu Bayar',   color: '#7a5614', Icon: Clock },
  waiting_confirmation: { label: 'Menunggu Konfirm', color: '#7a5614', Icon: Clock },
  confirmed:            { label: 'Dikonfirmasi',     color: '#2563eb', Icon: Clock },
  ready_for_pickup:     { label: 'Siap Ambil',       color: '#6a8338', Icon: ShoppingBag },
  completed:            { label: 'Selesai',           color: '#065f46', Icon: CheckCircle2 },
  cancelled:            { label: 'Dibatalkan',        color: '#991b1b', Icon: AlertCircle },
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
.sp-overview{--sp-ink:#283529;--sp-muted:#737d73;--sp-olive:#789044;--sp-line:#e7ebe3;color:var(--sp-ink);font-family:inherit;display:grid;gap:24px;max-width:1320px;margin:0 auto}
.sp-overview,.sp-overview *{box-sizing:border-box}
.sp-overview h2,.sp-overview h3,.sp-overview p{margin:0}
.sp-overview button{font:inherit;cursor:pointer}
.sp-overview button:focus-visible{outline:3px solid #789044;outline-offset:4px}

/* Hero */
.sp-hero{position:relative;overflow:hidden;border:1px solid #dce5cc;background:#edf2e4;border-radius:24px;padding:32px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:160px}
.sp-eyebrow{display:flex;align-items:center;flex-wrap:wrap;gap:10px;color:#667950;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.sp-eyebrow-divider{width:1px;height:12px;background:#bac9a9}
.sp-hero h2{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:clamp(22px,3vw,32px);line-height:1.2;font-weight:750;letter-spacing:-1px}
.sp-hero p{margin-top:8px;font-size:13px;line-height:1.6;color:#69765d}
.sp-export{display:inline-flex;align-items:center;justify-content:center;gap:9px;flex-shrink:0;background:#2f412a;border:1px solid #2f412a;color:white;padding:12px 16px;border-radius:12px;font-size:12px!important;font-weight:650!important;transition:background .18s}
.sp-export:hover{background:#435936}
.sp-plate{position:absolute;width:200px;height:200px;right:150px;bottom:-110px;border:1px solid #b6c59b60;border-radius:50%;box-shadow:0 0 0 24px #b6c59b18,0 0 0 48px #b6c59b0c;pointer-events:none}

/* KPI grid */
.sp-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.sp-kpi-card{background:#fff;border:1px solid var(--sp-line);border-radius:16px;padding:18px 20px;min-width:0}
.sp-kpi-label{font-size:11px;font-weight:600;color:var(--sp-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.sp-kpi-value{font-size:28px;font-weight:750;letter-spacing:-.8px;font-variant-numeric:tabular-nums;line-height:1;color:var(--sp-ink)}
.sp-kpi-sub{font-size:12px;color:var(--sp-muted);margin-top:5px}
.sp-kpi-green{color:#3f6b1f}
.sp-kpi-amber{color:#92400e}
.sp-kpi-red{color:#991b1b}

/* Impact */
.sp-impact{background:#1F281A;border-radius:20px;padding:24px 28px;color:#fff}
.sp-impact-title{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8da249;margin-bottom:16px}
.sp-impact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.sp-impact-item{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;min-width:0}
.sp-impact-item-label{font-size:11px;color:rgba(255,255,255,.55);margin-bottom:6px}
.sp-impact-item-value{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums;color:#fff;line-height:1}
.sp-impact-item-unit{font-size:11px;color:#8da249;margin-top:3px}

/* Workspace panels */
.sp-workspace{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sp-panel{border:1px solid var(--sp-line);border-radius:18px;background:#fff;overflow:hidden}
.sp-panel-head{padding:20px 22px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.sp-panel-title{display:flex;align-items:center;gap:10px}
.sp-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#f1f4e9;color:#71873f;flex-shrink:0}
.sp-icon-amber{background:#fef3c7;color:#92400e}
.sp-icon-blue{background:#dbeafe;color:#1e40af}
.sp-panel h3{font-size:14px;font-weight:700;letter-spacing:-.2px}
.sp-caption{display:block;font-size:11px;color:var(--sp-muted);margin-top:3px}
.sp-text-button{display:inline-flex;align-items:center;gap:5px;flex-shrink:0;border:0;background:none;color:#69823c;font-size:11px!important;font-weight:650!important;padding:6px 0;transition:color .18s}
.sp-text-button:hover{color:#344b20}
.sp-rows{padding:0 22px 10px}
.sp-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 0;border-top:1px solid #f0f2ed;min-height:66px}
.sp-row-title{font-size:12px;font-weight:600;line-height:1.5}
.sp-row-detail{font-size:11px;color:var(--sp-muted);margin-top:3px;line-height:1.5}
.sp-row-end{display:flex;align-items:center;gap:8px;flex-shrink:0}
.sp-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:600;white-space:nowrap;padding:5px 8px;border-radius:7px;background:#eef4e7;color:#617d38}
.sp-badge-warn{background:#fff4dd;color:#a27625}
.sp-badge-danger{background:#fff0ed;color:#b56c56}
.sp-review-button{background:#f7f0e2;color:#946e2b;border:1px solid #eee0c5;padding:6px 10px;border-radius:8px;font-size:11px!important;font-weight:650!important;transition:background .18s}
.sp-review-button:hover{background:#f0e3c8}

/* Recent orders */
.sp-orders{background:#fff;border:1px solid var(--sp-line);border-radius:18px;overflow:hidden}
.sp-orders-head{padding:20px 22px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.sp-order-row{display:flex;align-items:center;gap:14px;padding:12px 22px;border-top:1px solid #f0f2ed;min-width:0;transition:background .15s}
.sp-order-row:hover{background:#fafcf8}
.sp-order-code{font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;font-weight:700;color:var(--sp-ink);white-space:nowrap}
.sp-order-meta{flex:1;min-width:0}
.sp-order-name{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-order-items{font-size:11px;color:var(--sp-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-order-status{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;white-space:nowrap;padding:3px 8px;border-radius:6px;background:#f0f2ed;color:#53624a}
.sp-order-amount{font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;color:#3f6b1f}

/* Methodology */
.sp-method{border:1px solid var(--sp-line);border-radius:14px;background:#f8faf6;overflow:hidden}
.sp-method-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:14px 18px;background:none;border:0;color:#737f68;text-align:left;font-size:11px!important}
.sp-method-toggle:hover{background:#f0f4e9}
.sp-chevron{transition:transform .2s;flex-shrink:0}
.sp-chevron-open{transform:rotate(180deg)}
.sp-formulas{border-top:1px solid var(--sp-line);padding:16px 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.sp-formula-title{font-size:11px;font-weight:650;margin-bottom:5px;color:#556445}
.sp-formula-value{font-size:11px;color:var(--sp-muted);line-height:1.6}

@media(max-width:1100px){.sp-kpi{grid-template-columns:repeat(2,1fr)}.sp-impact-grid{grid-template-columns:repeat(2,1fr)}.sp-workspace{grid-template-columns:1fr}}
@media(max-width:720px){.sp-hero{padding:22px;flex-direction:column;gap:16px}.sp-kpi{grid-template-columns:repeat(2,1fr)}.sp-impact-grid{grid-template-columns:repeat(2,1fr)}.sp-workspace{grid-template-columns:1fr}.sp-formulas{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.sp-overview *{transition:none!important}}
`;

/* ─── Main Tab ───────────────────────────────────────────────────────────── */
export const OverviewTab: React.FC<OverviewTabProps> = ({ onSelectTab }) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const methodologyId = useId();

  const { stats, recentOrders, loading, error, reload } = useAdminDashboard();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 14, color: '#5b6855' }}>
        <Loader2 size={26} className="animate-spin" />
        <span style={{ fontSize: 16 }}>Memuat ringkasan platform…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ border: '1px dashed #d3dcc4', borderRadius: 20, textAlign: 'center', padding: '64px 24px' }}>
        <AlertCircle size={28} style={{ color: '#6a8338', margin: '0 auto 14px', display: 'block' }} />
        <h3 style={{ fontSize: 20, margin: '0 0 8px' }}>Gagal memuat data</h3>
        <p style={{ color: '#5b6855', fontSize: 15, marginBottom: 20 }}>{error}</p>
        <button type="button" onClick={() => reload()} style={{ border: '1px solid #cfdcb9', background: '#f0f5e8', color: '#4b6529', borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Coba lagi
        </button>
      </div>
    );
  }

  const handleExportCSV = () => {
    const rows = [
      ['Metrik', 'Nilai'],
      ['Total User', stats.users],
      ['Buyer', stats.buyers],
      ['Seller', stats.sellers],
      ['Mitra Terverifikasi', stats.merchantsVerified],
      ['Mitra Pending', stats.merchantsPending],
      ['Total Pesanan', stats.orders],
      ['Revenue', stats.revenue],
      ['Dispute Terbuka', stats.openDisputes],
      ['Porsi Diselamatkan', stats.impact.totalPortions],
      ['Sampah Dicegah (kg)', stats.impact.totalWeightKg],
      ['CO2 Hemat (kg)', stats.impact.totalCo2Kg],
    ].map((r) => r.join(',')).join('\n');

    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows);
    const a = document.createElement('a');
    a.href = uri;
    a.download = `sisapiring_dashboard_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sp-overview">
      <style>{styles}</style>

      {/* Hero */}
      <header className="sp-hero">
        <div>
          <div className="sp-eyebrow">
            <span>SisaPiring / Admin</span>
            <span className="sp-eyebrow-divider" aria-hidden="true" />
            <span>Live Dashboard</span>
          </div>
          <h2>Ringkasan Platform</h2>
          <p>Data real-time dari database — tidak ada mock.</p>
        </div>
        <div className="sp-plate" aria-hidden="true"><Leaf size={40} strokeWidth={1} /></div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, zIndex: 1, position: 'relative' }}>
          <button type="button" className="sp-export" onClick={handleExportCSV}>
            <Download size={15} strokeWidth={1.8} /> Unduh CSV
          </button>
          <button type="button" onClick={() => reload()} className="sp-export" style={{ background: 'transparent', border: '1px solid #2f412a', color: '#2f412a' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="sp-kpi">
        <div className="sp-kpi-card">
          <div className="sp-kpi-label">Total User</div>
          <div className="sp-kpi-value">{fmt(stats.users)}</div>
          <div className="sp-kpi-sub">{fmt(stats.buyers)} buyer · {fmt(stats.sellers)} seller</div>
        </div>
        <div className="sp-kpi-card">
          <div className="sp-kpi-label">Total Pesanan</div>
          <div className={`sp-kpi-value ${stats.orders > 0 ? 'sp-kpi-green' : ''}`}>{fmt(stats.orders)}</div>
          <div className="sp-kpi-sub">Semua status</div>
        </div>
        <div className="sp-kpi-card">
          <div className="sp-kpi-label">Revenue</div>
          <div className="sp-kpi-value sp-kpi-green" style={{ fontSize: 22 }}>{formatRp(stats.revenue)}</div>
          <div className="sp-kpi-sub">Pesanan lunas</div>
        </div>
        <div className="sp-kpi-card">
          <div className="sp-kpi-label">Dispute Terbuka</div>
          <div className={`sp-kpi-value ${stats.openDisputes > 0 ? 'sp-kpi-red' : 'sp-kpi-green'}`}>{fmt(stats.openDisputes)}</div>
          <div className="sp-kpi-sub">{stats.openDisputes > 0 ? 'Perlu penanganan' : 'Semua bersih'}</div>
        </div>
      </div>

      {/* Impact Bar */}
      <div className="sp-impact">
        <div className="sp-impact-title">Dampak Lingkungan Platform · Total Kumulatif</div>
        <div className="sp-impact-grid">
          {[
            { label: 'Porsi Diselamatkan', value: fmt(stats.impact.totalPortions), unit: 'porsi makanan', Icon: Utensils },
            { label: 'Sampah Dicegah', value: `${stats.impact.totalWeightKg.toFixed(1)}`, unit: 'kg food waste', Icon: Leaf },
            { label: 'Emisi Berkurang', value: `${stats.impact.totalCo2Kg.toFixed(1)}`, unit: 'kg CO₂e', Icon: TrendingUp },
            { label: 'Air Hemat', value: fmt(Math.round(stats.impact.totalWaterLiters)), unit: 'liter virtual water', Icon: Info },
          ].map((item) => (
            <div key={item.label} className="sp-impact-item">
              <div className="sp-impact-item-label">{item.label}</div>
              <div className="sp-impact-item-value">{item.value}</div>
              <div className="sp-impact-item-unit">{item.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Panels */}
      <div className="sp-workspace">
        {/* Mitra UMKM */}
        <section className="sp-panel" aria-label="Mitra UMKM">
          <div className="sp-panel-head">
            <div className="sp-panel-title">
              <div className="sp-icon"><Store size={18} strokeWidth={1.7} /></div>
              <div><h3>Mitra UMKM</h3><span className="sp-caption">Verifikasi & produk</span></div>
            </div>
            <button type="button" className="sp-text-button" onClick={() => onSelectTab('seller-governance')}>
              Kelola <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="sp-rows">
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Mitra terverifikasi</div>
                <div className="sp-row-detail">{fmt(stats.merchantsVerified)} gerai aktif</div>
              </div>
              <div className="sp-row-end">
                <span className="sp-badge"><ShieldCheck size={11} /> Verified</span>
              </div>
            </div>
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Menunggu verifikasi</div>
                <div className="sp-row-detail">{fmt(stats.merchantsPending)} mitra baru</div>
              </div>
              <div className="sp-row-end">
                {stats.merchantsPending > 0 ? (
                  <button type="button" className="sp-review-button" onClick={() => onSelectTab('seller-governance')}>
                    Tinjau
                  </button>
                ) : (
                  <span className="sp-badge">Semua bersih</span>
                )}
              </div>
            </div>
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Produk dalam tinjauan</div>
                <div className="sp-row-detail">{fmt(stats.productsUnderReview)} menu</div>
              </div>
              <div className="sp-row-end">
                <button type="button" className="sp-text-button" onClick={() => onSelectTab('product-curation')}>
                  Lihat <Utensils size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pembeli & Transaksi */}
        <section className="sp-panel" aria-label="Pembeli">
          <div className="sp-panel-head">
            <div className="sp-panel-title">
              <div className="sp-icon sp-icon-amber"><Users size={18} strokeWidth={1.7} /></div>
              <div><h3>Pembeli & Transaksi</h3><span className="sp-caption">Pesanan & komplain</span></div>
            </div>
            <button type="button" className="sp-text-button" onClick={() => onSelectTab('order-escrow')}>
              Lihat <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="sp-rows">
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Total buyer terdaftar</div>
                <div className="sp-row-detail">{fmt(stats.buyers)} akun</div>
              </div>
              <div className="sp-row-end">
                <button type="button" className="sp-text-button" onClick={() => onSelectTab('user-access')}>
                  Kelola <Users size={12} />
                </button>
              </div>
            </div>
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Komplain terbuka</div>
                <div className="sp-row-detail">{fmt(stats.openDisputes)} tiket</div>
              </div>
              <div className="sp-row-end">
                <span className={`sp-badge ${stats.openDisputes > 0 ? 'sp-badge-danger' : ''}`}>
                  {stats.openDisputes > 0 ? 'Perlu ditangani' : 'Bersih'}
                </span>
              </div>
            </div>
            <div className="sp-row">
              <div>
                <div className="sp-row-title">Ulasan pembeli</div>
                <div className="sp-row-detail">Moderasi & balas</div>
              </div>
              <div className="sp-row-end">
                <button type="button" className="sp-text-button" onClick={() => onSelectTab('reviews-moderation')}>
                  Lihat <MessageSquare size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section className="sp-orders" aria-label="Pesanan terbaru">
          <div className="sp-orders-head">
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>8 Pesanan Terbaru</h3>
              <span style={{ fontSize: 12, color: '#737d73', marginTop: 3, display: 'block' }}>Update real-time dari database</span>
            </div>
            <button type="button" className="sp-text-button" onClick={() => onSelectTab('order-escrow')}>
              Semua pesanan <ArrowUpRight size={13} />
            </button>
          </div>
          {recentOrders.map((order) => {
            const cfg = ORDER_STATUS_CFG[order.status] ?? { label: order.statusLabel, color: '#5b6855', Icon: Package };
            return (
              <div key={order.id} className="sp-order-row">
                <span className="sp-order-code">{order.id}</span>
                <div className="sp-order-meta">
                  <div className="sp-order-name">{order.customerName}</div>
                  <div className="sp-order-items">
                    {order.merchant?.businessName ?? '—'}
                    {order.items.length > 0 && ` · ${order.items[0].productName}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`}
                  </div>
                </div>
                <span className="sp-order-status" style={{ color: cfg.color, background: `${cfg.color}18` }}>
                  <cfg.Icon size={10} />{cfg.label}
                </span>
                <span className="sp-order-amount">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.totalPayment)}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {/* Methodology */}
      <section className="sp-method" aria-label="Metode perhitungan dampak">
        <button
          type="button"
          className="sp-method-toggle"
          aria-expanded={showMethodology}
          aria-controls={methodologyId}
          onClick={() => setShowMethodology((p) => !p)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={14} />Cara menghitung dampak lingkungan
          </span>
          <ChevronDown size={14} className={`sp-chevron ${showMethodology ? 'sp-chevron-open' : ''}`} />
        </button>
        {showMethodology && (
          <div id={methodologyId} className="sp-formulas">
            <div><div className="sp-formula-title">Sampah dicegah</div><p className="sp-formula-value">porsi × berat rata-rata (kg)</p></div>
            <div><div className="sp-formula-title">Emisi berkurang</div><p className="sp-formula-value">sampah (kg) × 2.5 kg CO₂e (metana TPA)</p></div>
            <div><div className="sp-formula-title">Jejak air pangan</div><p className="sp-formula-value">sampah (kg) × 800 liter virtual water</p></div>
          </div>
        )}
      </section>
    </div>
  );
};
