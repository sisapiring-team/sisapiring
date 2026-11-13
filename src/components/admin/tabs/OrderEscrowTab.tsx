import React, { useId } from 'react';
import {
  Search, CheckCircle2, Clock, AlertCircle, X, Wallet, ArrowRight,
} from 'lucide-react';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import { AdminTransactionRecord } from '../../../data/adminData';
import { OrderRecord } from '../../RescueModals';
import { AdminMacroStats } from '../types';

interface OrderEscrowTabProps {
  transactions: AdminTransactionRecord[];
  orders: OrderRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  macroStats: AdminMacroStats;
  onReleaseEscrow: (trx: AdminTransactionRecord) => void;
}

const styles = `
.sp-escrow{
  --oe-ink:#283529;--oe-text:#44513f;--oe-muted:#5b6855;--oe-line:#e3e9db;--oe-bg:#f6f8f2;
  --oe-green:#69823c;--oe-green-dark:#556d2f;--oe-soft:#edf2e4;
  font-family:inherit;color:var(--oe-ink);display:grid;gap:24px;max-width:1280px;margin:0 auto;font-size:15px;line-height:1.6
}
.sp-escrow,.sp-escrow *{box-sizing:border-box}
.sp-escrow h2,.sp-escrow h3,.sp-escrow p,.sp-escrow dl,.sp-escrow dd{margin:0}
.sp-escrow button,.sp-escrow input{font:inherit}
.sp-escrow button{cursor:pointer}
.sp-escrow button:focus-visible,.sp-escrow input:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.oe-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* Header */
.oe-header{display:flex;align-items:center;gap:16px}
.oe-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--oe-soft);color:#6a8338;border:1px solid #dce6cb}
.oe-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.oe-header h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px;line-height:1.3}
.oe-header p{color:var(--oe-muted);font-size:15px;margin-top:2px;max-width:640px}

/* Stats */
.oe-stats{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px}
.oe-panel{background:#fff;border:1px solid var(--oe-line);border-radius:18px;padding:24px;min-width:0}
.oe-panel-title{font-size:16px;font-weight:650}
.oe-panel-sub{font-size:14px;color:var(--oe-muted);margin-top:2px!important}
.oe-bar{display:flex;gap:3px;height:14px;margin-top:20px;border-radius:999px;overflow:hidden;background:#eceee8}
.oe-bar-held{background:#d9a93f;border-radius:999px 0 0 999px;min-width:0}
.oe-bar-settled{background:var(--oe-green);border-radius:0 999px 999px 0;min-width:0}
.oe-bar-caption{font-size:14px;color:var(--oe-muted);margin-top:10px!important}
.oe-funds{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:22px}
.oe-fund{min-width:0;padding-left:14px;border-left:4px solid #d9a93f}
.oe-fund-settled{border-left-color:var(--oe-green)}
.oe-fund dt{font-size:14px;font-weight:600;color:var(--oe-muted)}
.oe-fund dd{margin:0}
.oe-stat-value{font-size:26px;font-weight:700;letter-spacing:-.4px;line-height:1.3;margin-top:4px!important;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.oe-fund-held .oe-stat-value{color:#7a5614}
.oe-fund-settled .oe-stat-value{color:#3f5a1f}
.oe-fund-note{font-size:14px;color:var(--oe-muted);margin-top:2px!important}
.oe-total-card{background:var(--oe-soft);border:1px solid #dce6cb;border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:center;min-width:0}
.oe-total-card dt{font-size:14px;font-weight:600;color:#4b6329}
.oe-total-card dd{margin:0}
.oe-total-number{font-size:44px;font-weight:700;letter-spacing:-1px;line-height:1.15;color:#33481a;margin-top:6px!important;font-variant-numeric:tabular-nums}
.oe-total-unit{font-size:16px;font-weight:600;color:#4b6329;margin-top:2px!important}
.oe-total-sync{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#4b6329;margin-top:14px!important}
.oe-total-sync::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--oe-green)}

/* Toolbar */
.oe-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px;background:#fff;border:1px solid var(--oe-line);border-radius:16px}
.oe-list-label{font-size:16px;font-weight:650;white-space:nowrap}
.oe-count{display:block;font-size:14px;font-weight:400;color:var(--oe-muted);margin-top:2px}
.oe-search{position:relative;width:340px;max-width:100%;display:flex;align-items:center}
.oe-search-icon{position:absolute;left:14px;color:#6f8062;pointer-events:none}
.oe-search input{width:100%;min-width:0;height:46px;background:var(--oe-bg);color:var(--oe-ink);border:1px solid #d9e1cf;border-radius:12px;padding:0 40px 0 42px;font-size:15px}
.oe-search input::placeholder{color:#6b7861}
.oe-search input:hover{border-color:#c5d1b6}
.oe-clear{position:absolute;right:6px;background:none;border:0;border-radius:8px;width:32px;height:32px;display:grid;place-items:center;color:#5f6e53}
.oe-clear:hover{background:#e8efdd}

/* Cards */
.oe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}
.oe-card{min-width:0;border:1px solid var(--oe-line);background:#fff;border-radius:18px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.oe-card:hover{border-color:#d3dcc4;box-shadow:0 6px 20px rgba(40,53,41,.06)}
.oe-card-body{padding:24px}
.oe-card-meta{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px 12px}
.oe-code{font-family:'SFMono-Regular',Consolas,monospace;font-size:16px;font-weight:700;color:var(--oe-ink);overflow-wrap:anywhere;min-width:0}
.oe-time{display:block;font-size:14px;color:var(--oe-muted);margin-top:2px}
.oe-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600;line-height:1.4;background:#f2f4ed;color:#53624a;max-width:100%}
.oe-status svg{flex-shrink:0}
.oe-status-settled{background:#e9f2de;color:#47651f}
.oe-status-held{background:#fff3dc;color:#7a5614}
.oe-status-other{background:#f8e9e2;color:#8a4a33}

.oe-item{margin-top:18px!important;font-size:18px;font-weight:700;letter-spacing:-.2px;line-height:1.45;overflow-wrap:anywhere}
.oe-people{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px!important}
.oe-person{background:var(--oe-bg);border-radius:12px;padding:12px 14px;min-width:0}
.oe-person dt{font-size:13px;color:var(--oe-muted);line-height:1.4}
.oe-person dd{font-size:15px;font-weight:600;line-height:1.5;margin-top:2px!important;overflow-wrap:anywhere}

.oe-total{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px;background:var(--oe-soft);border-radius:12px;padding:14px 16px}
.oe-total-label{font-size:14px;font-weight:600;color:#4b6329}
.oe-total-method{display:block;font-size:13px;font-weight:500;color:#5b7138;margin-top:1px}
.oe-total-value{font-size:20px;font-weight:700;color:#33481a;font-variant-numeric:tabular-nums;text-align:right}

.oe-actions{padding:16px 24px;border-top:1px solid #edf0e7;background:#fbfcf8}
.oe-primary{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:12px;border:1px solid var(--oe-green);background:var(--oe-green);color:#fff;font-size:15px;font-weight:600;padding:10px 18px;transition:background .18s}
.oe-primary:hover{background:var(--oe-green-dark);border-color:var(--oe-green-dark)}
.oe-done{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--oe-muted);min-height:48px}
.oe-done svg{color:#6f8a3d;flex-shrink:0}

/* Empty */
.oe-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:18px;text-align:center;padding:56px 24px}
.oe-empty-icon{width:56px;height:56px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--oe-soft);color:#6a8338}
.oe-empty h3{font-size:20px;margin-bottom:6px}
.oe-empty p{font-size:15px;color:var(--oe-muted)}
.oe-reset{margin-top:20px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:12px;padding:10px 20px;min-height:44px;font-size:15px;font-weight:600}
.oe-reset:hover{background:#e6eed9}

@media(max-width:1100px){
  .oe-grid{grid-template-columns:1fr}
  .oe-stats{grid-template-columns:1fr}
  .oe-toolbar{align-items:stretch;flex-direction:column}
  .oe-search{width:100%}
}
@media(max-width:600px){
  .sp-escrow{gap:20px}
  .oe-header{gap:12px}
  .oe-header-icon{width:46px;height:46px;border-radius:14px}
  .oe-header h2{font-size:24px}
  .oe-header p{font-size:14px}
  .oe-panel,.oe-total-card{padding:20px 18px}
  .oe-funds{grid-template-columns:1fr}
  .oe-stat-value{font-size:24px}
  .oe-total-number{font-size:38px}
  .oe-toolbar{padding:16px}
  .oe-card-body{padding:20px 18px}
  .oe-item{font-size:17px}
  .oe-people{grid-template-columns:1fr}
  .oe-actions{padding:16px 18px}
}
@media(max-width:360px){
  .oe-total{align-items:flex-start;flex-direction:column;gap:4px}
  .oe-total-value{text-align:left}
}
@media(prefers-reduced-motion:reduce){.sp-escrow *{transition:none!important}}
`;

const gatewayView = (status: string) => {
  if (status === 'Selesai (Settled)') return { cls: 'oe-status-settled', Icon: CheckCircle2, label: 'Sudah cair' };
  if (status === 'Dana Ditahan (Escrow)') return { cls: 'oe-status-held', Icon: Clock, label: 'Dana ditahan' };
  return { cls: 'oe-status-other', Icon: AlertCircle, label: status };
};

const TransactionCard = ({
  trx, onReleaseEscrow,
}: Pick<OrderEscrowTabProps, 'onReleaseEscrow'> & { trx: AdminTransactionRecord }) => {
  const { cls, Icon, label } = gatewayView(trx.gatewayStatus);
  const isHeld = trx.gatewayStatus === 'Dana Ditahan (Escrow)';
  const isSettled = trx.gatewayStatus === 'Selesai (Settled)';

  return (
    <article className="oe-card" aria-label={`Pesanan ${trx.orderCode}`}>
      <div className="oe-card-body">
        <div className="oe-card-meta">
          <div>
            <span className="oe-code">{trx.orderCode}</span>
            <span className="oe-time">{trx.timestamp}</span>
          </div>
          <span className={`oe-status ${cls}`}><Icon size={15} aria-hidden="true" />{label}</span>
        </div>

        <p className="oe-item">{trx.quantity}x {trx.itemTitle}</p>

        <dl className="oe-people">
          <div className="oe-person"><dt>Pembeli</dt><dd>{trx.buyerName}</dd></div>
          <div className="oe-person"><dt>Mitra UMKM</dt><dd>{trx.merchantName}</dd></div>
        </dl>

        <div className="oe-total">
          <div className="oe-total-label">
            Total bayar
            <span className="oe-total-method">{trx.paymentMethod}</span>
          </div>
          <div className="oe-total-value">{formatRupiah(trx.totalPaid)}</div>
        </div>
      </div>

      <div className="oe-actions">
        {isHeld ? (
          <button
            type="button"
            className="oe-primary"
            aria-label={`Lepaskan dana pesanan ${trx.orderCode}`}
            onClick={() => onReleaseEscrow(trx)}
          >
            Lepaskan dana<ArrowRight size={17} aria-hidden="true" />
          </button>
        ) : (
          <p className="oe-done">
            <CheckCircle2 size={18} aria-hidden="true" />
            {isSettled ? 'Dana sudah diterima mitra, tidak ada tindakan.' : 'Tidak ada tindakan yang diperlukan.'}
          </p>
        )}
      </div>
    </article>
  );
};

export const OrderEscrowTab: React.FC<OrderEscrowTabProps> = ({
  transactions,
  orders,
  searchQuery,
  onSearchChange,
  macroStats,
  onReleaseEscrow,
}) => {
  const searchId = useId();

  const settledTotal = transactions
    .filter((t) => t.gatewayStatus === 'Selesai (Settled)')
    .reduce((acc, t) => acc + t.totalPaid, 0);

  const filteredTransactions = transactions.filter((trx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      trx.orderCode.toLowerCase().includes(q) ||
      trx.buyerName.toLowerCase().includes(q) ||
      trx.merchantName.toLowerCase().includes(q)
    );
  });

  const hasSearch = searchQuery.trim().length > 0;

  const heldTotal = macroStats.totalEscrowHeld;
  const fundsTotal = heldTotal + settledTotal;
  const heldPct = fundsTotal > 0 ? Math.round((heldTotal / fundsTotal) * 100) : 0;
  const settledPct = fundsTotal > 0 ? 100 - heldPct : 0;

  return (
    <div className="sp-escrow">
      <style>{styles}</style>

      <header className="oe-header">
        <div className="oe-header-icon" aria-hidden="true"><Wallet size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="oe-eyebrow">SisaPiring · Pesanan</div>
          <h2>Pesanan & dana escrow</h2>
          <p>Dana pembeli ditahan aman di rekening bersama sampai serah terima makanan diverifikasi lewat QR Code.</p>
        </div>
      </header>

      <section className="oe-stats" aria-label="Ringkasan pesanan dan dana">
        <div className="oe-panel">
          <h3 className="oe-panel-title">Ringkasan dana</h3>
          <p className="oe-panel-sub">Perbandingan dana yang masih ditahan dan yang sudah dicairkan ke mitra.</p>

          <div
            className="oe-bar"
            role="img"
            aria-label={`Dana ditahan ${heldPct}%, sudah cair ${settledPct}%`}
          >
            {fundsTotal > 0 && (
              <>
                <div className="oe-bar-held" style={{ width: `${heldPct}%` }} />
                <div className="oe-bar-settled" style={{ width: `${settledPct}%` }} />
              </>
            )}
          </div>
          <p className="oe-bar-caption">
            {fundsTotal > 0
              ? `${heldPct}% masih ditahan · ${settledPct}% sudah cair`
              : 'Belum ada dana yang tercatat.'}
          </p>

          <dl className="oe-funds">
            <div className="oe-fund oe-fund-held">
              <dt>Tertahan di escrow</dt>
              <dd className="oe-stat-value">{formatRupiah(macroStats.totalEscrowHeld)}</dd>
              <dd className="oe-fund-note">Menunggu verifikasi QR</dd>
            </div>
            <div className="oe-fund oe-fund-settled">
              <dt>Sudah cair</dt>
              <dd className="oe-stat-value">{formatRupiah(settledTotal)}</dd>
              <dd className="oe-fund-note">Sudah masuk ke dompet UMKM</dd>
            </div>
          </dl>
        </div>

        <dl className="oe-total-card">
          <dt>Total transaksi dipantau</dt>
          <dd className="oe-total-number">{(transactions.length + orders.length).toLocaleString('id-ID')}</dd>
          <dd className="oe-total-unit">pesanan</dd>
          <dd className="oe-total-sync">Sinkron real-time</dd>
        </dl>
      </section>

      <div className="oe-toolbar">
        <div className="oe-list-label">
          Daftar pesanan
          <span className="oe-count" role="status">{filteredTransactions.length.toLocaleString('id-ID')} pesanan ditampilkan</span>
        </div>
        <div className="oe-search">
          <label htmlFor={searchId} className="oe-sr-only">Cari kode pesanan, pembeli, atau toko</label>
          <Search size={18} className="oe-search-icon" aria-hidden="true" />
          <input id={searchId} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari kode, pembeli, atau toko…" />
          {searchQuery && (
            <button type="button" className="oe-clear" aria-label="Hapus pencarian" onClick={() => onSearchChange('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {filteredTransactions.length > 0 ? (
        <div className="oe-grid">
          {filteredTransactions.map((trx) => (
            <TransactionCard key={trx.id} trx={trx} onReleaseEscrow={onReleaseEscrow} />
          ))}
        </div>
      ) : (
        <div className="oe-empty">
          <div className="oe-empty-icon" aria-hidden="true">{hasSearch ? <Search size={24} /> : <Wallet size={24} />}</div>
          <h3>{hasSearch ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}</h3>
          <p>{hasSearch ? 'Coba kode pesanan, nama pembeli, atau nama toko yang lain.' : 'Pesanan dan status dananya akan muncul di sini.'}</p>
          {hasSearch && (
            <button type="button" className="oe-reset" onClick={() => onSearchChange('')}>
              Hapus pencarian
            </button>
          )}
        </div>
      )}
    </div>
  );
};