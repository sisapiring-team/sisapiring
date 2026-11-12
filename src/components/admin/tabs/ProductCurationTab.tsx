import React, { useId } from 'react';
import {
  Search, Clock, CheckCircle2, AlertTriangle, RotateCcw, Ban,
  ChevronDown, Utensils, X, SlidersHorizontal, Package,
} from 'lucide-react';
import { ResilientImage } from '../../ResilientImage';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import type { SisaPiringItem } from '../../../data/sisaPiringCatalog';
import type { ProductMonitoringMeta, ProductMonitoringStatus } from '../../../data/adminData';

interface ProductCurationTabProps {
  displayProducts: SisaPiringItem[];
  productMonitoring: Record<string, ProductMonitoringMeta>;
  productStatusFilter: 'all' | ProductMonitoringStatus;
  onStatusFilterChange: (status: 'all' | ProductMonitoringStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRestoreProduct: (itemId: string, title: string) => void;
  onRequestTakedown: (item: SisaPiringItem) => void;
}

const styles = `
.sp-curation{--pc-ink:#283529;--pc-muted:#5f6c5c;--pc-olive:#69823c;--pc-border:#e5eadf;max-width:1320px;margin:0 auto;color:var(--pc-ink);font-family:inherit;display:grid;gap:24px}
.sp-curation,.sp-curation *{box-sizing:border-box}
.sp-curation h2,.sp-curation p{margin:0}
.sp-curation button,.sp-curation input,.sp-curation select{font:inherit}
.sp-curation button{cursor:pointer}
.sp-curation button:focus-visible,.sp-curation input:focus-visible,.sp-curation select:focus-visible{outline:3px solid #8da249;outline-offset:3px}
.pc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pc-header{display:flex;align-items:center;gap:16px;padding:8px 2px}
.pc-header-icon{width:52px;height:52px;flex-shrink:0;display:grid;place-items:center;background:#edf2e4;color:#789044;border:1px solid #e0e8d3;border-radius:17px}
.pc-eyebrow{font-size:13px;letter-spacing:.1em;text-transform:uppercase;font-weight:650;color:#849376;margin-bottom:7px}
.pc-header h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:32px;line-height:1.2;font-weight:750;letter-spacing:-.9px}
.pc-header p{font-size:15px;line-height:1.6;color:var(--pc-muted);margin-top:7px}
.pc-sheet{background:#fff;border:1px solid var(--pc-border);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px #28352903}
.pc-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 24px}
.pc-list-title{font-size:16px;font-weight:650;white-space:nowrap}
.pc-controls{display:flex;align-items:center;gap:10px;min-width:0}
.pc-search{position:relative;display:flex;align-items:center;width:300px;max-width:100%}
.pc-search-icon{position:absolute;left:13px;color:#95a08b;pointer-events:none}
.pc-search input{width:100%;min-width:0;height:48px;background:#f8faf6;border:1px solid #e5eadf;border-radius:11px;padding:0 35px 0 38px;color:var(--pc-ink);font-size:16px;transition:border-color .18s}
.pc-search input::placeholder{color:#8b9583}
.pc-search input:hover{border-color:#cdd8bf}
.pc-clear{position:absolute;right:8px;display:grid;place-items:center;width:27px;height:27px;border:0;border-radius:6px;color:#86917e;background:none}
.pc-clear:hover{background:#e9efdf;color:#455b31}
.pc-filter{position:relative;display:flex;align-items:center;flex-shrink:0}
.pc-filter-icon{position:absolute;left:12px;color:#8b967f;pointer-events:none}
.pc-filter-chevron{position:absolute;right:12px;color:#8b967f;pointer-events:none}
.pc-filter select{appearance:none;width:194px;height:48px;border:1px solid #e5eadf;border-radius:11px;background:#fff;padding:0 32px 0 35px;font-size:16px;font-weight:550;color:#58664a;cursor:pointer}
.pc-table-scroll{overflow-x:auto}
.pc-table{width:100%;border-collapse:collapse;text-align:left;font-size:15px;table-layout:auto}
.pc-table thead{background:#f8faf5}
.pc-table th{padding:14px 16px;border-block:1px solid #edf0e7;color:#5f6e54;font-size:13px;letter-spacing:.06em;text-transform:uppercase;font-weight:650;white-space:nowrap}
.pc-table th:first-child{padding-left:24px}.pc-table th:last-child{padding-right:24px;text-align:right}
.pc-table td{padding:22px 16px;border-bottom:1px solid #eff2eb;vertical-align:middle}
.pc-table td:first-child{padding-left:24px}.pc-table td:last-child{padding-right:24px;text-align:right}
.pc-table tbody tr:last-child td{border-bottom:0}
.pc-product-row{transition:background .18s}
.pc-product-row:hover{background:#fbfcf8}
.pc-product-row.pc-inactive{background:#fcfbf9}
.pc-product-row.pc-inactive:hover{background:#f8f5f0}
.pc-menu{display:flex;align-items:center;gap:13px;min-width:230px;max-width:360px}
.pc-photo{width:64px;height:64px;flex-shrink:0;overflow:hidden;border-radius:13px;background:#f0f3e9;border:1px solid #e8ecdF}
.pc-photo img{display:block;width:100%;height:100%;object-fit:cover}
.pc-menu-copy{min-width:0}
.pc-menu-title{font-weight:650;font-size:16px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.pc-merchant{font-size:14px;color:var(--pc-muted);line-height:1.6;margin-top:4px;overflow-wrap:anywhere}
.pc-district{font-size:13px;color:#68765f;margin-top:2px;line-height:1.5}
.pc-number{font-family:'SFMono-Regular',Consolas,monospace;font-variant-numeric:tabular-nums;white-space:nowrap}
.pc-rescue-price{color:var(--pc-olive);font-size:15px;font-weight:700}
.pc-original-price{display:block;font-size:13px;text-decoration:line-through;color:#74806a;margin-top:5px}
.pc-stock{font-weight:600;font-size:15px;white-space:nowrap}
.pc-stock-unit{font-size:13px;font-weight:400;color:#68765f;margin-left:4px}
.pc-pickup{display:flex;align-items:center;gap:6px;min-width:105px;font-size:14px;line-height:1.6;color:#67735c}
.pc-pickup svg{flex-shrink:0;color:#98a58a}
.pc-status{display:inline-flex;align-items:center;gap:5px;border-radius:7px;padding:6px 9px;font-size:13px;font-weight:650;white-space:nowrap;background:#eef4e6;color:#5b7834}
.pc-status-review{background:#fff4df;color:#805b18}
.pc-status-inactive{background:#f5ebe7;color:#8e503d}
.pc-reports{display:block;margin-top:6px;font-size:13px;color:#975a43;white-space:nowrap}
.pc-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;border-radius:8px;padding:8px 11px;font-size:14px!important;font-weight:600!important;white-space:nowrap;border:1px solid #eddfd7;color:#8e503d;background:#fff;transition:background .18s,border-color .18s}
.pc-action:hover{background:#fbefe9;border-color:#dcb6a4}
.pc-action-restore{border-color:#d9e4c9;color:#66803c;background:#f2f6eb}
.pc-action-restore:hover{background:#e6eed9;border-color:#bdcf9f}
.pc-footer{padding:14px 24px;border-top:1px solid #edf0e7;background:#fdfefa;color:#68765f;font-size:13px;line-height:1.6}
.pc-empty{padding:58px 24px;text-align:center;border-top:1px solid #edf0e7}
.pc-empty-icon{display:grid;place-items:center;width:50px;height:50px;background:#f0f4e9;border-radius:15px;color:#91a377;margin:0 auto 16px}
.pc-empty-title{font-size:17px;font-weight:650;margin-bottom:7px}
.pc-empty p{color:var(--pc-muted);font-size:15px;line-height:1.7}
.pc-reset{margin-top:18px;border:1px solid #dce6ce;background:#f1f5e9;color:#66803c;border-radius:9px;padding:9px 14px;font-size:14px!important;font-weight:600!important}
.pc-reset:hover{background:#e7efda}
.pc-mobile-label{display:none}
@media(min-width:1150px){.pc-table th,.pc-table td{padding-inline:22px}.pc-table th:first-child,.pc-table td:first-child{padding-left:28px}.pc-table th:last-child,.pc-table td:last-child{padding-right:28px}}
@media(max-width:1000px){.pc-toolbar{align-items:flex-start;flex-direction:column;gap:14px}.pc-controls{width:100%}.pc-search{flex:1;width:auto}.pc-table td{padding-inline:12px}.pc-table th{padding-inline:12px}.pc-menu{min-width:200px}.pc-photo{width:60px;height:60px}}
@media(max-width:1100px){.pc-table-scroll{overflow:visible}.pc-table,.pc-table tbody{display:block}.pc-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.pc-table tbody{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 20px 20px}.pc-product-row{display:grid;grid-template-columns:1fr auto;grid-template-areas:'menu menu' 'price stock' 'pickup pickup' 'status action';gap:16px 12px;border:1px solid #e6eadf;border-radius:14px;padding:18px}.pc-table td,.pc-table td:first-child,.pc-table td:last-child{padding:0;border:0!important;text-align:left;min-width:0}.pc-table td:nth-child(1){grid-area:menu;padding-bottom:16px;border-bottom:1px solid #edf0e7!important}.pc-table td:nth-child(2){grid-area:price}.pc-table td:nth-child(3){grid-area:stock;text-align:right}.pc-table td:nth-child(4){grid-area:pickup}.pc-table td:nth-child(5){grid-area:status;align-self:center}.pc-table td:nth-child(6){grid-area:action;text-align:right;align-self:center}.pc-menu{min-width:0;max-width:none;gap:12px}.pc-photo{width:64px;height:64px}.pc-mobile-label{display:block;color:#68765f;font-size:13px;margin-bottom:6px}.pc-table td:nth-child(4) .pc-mobile-label{display:inline;margin:0 7px 0 0}.pc-table td:nth-child(4){display:flex;flex-wrap:wrap;align-items:center;gap:3px}.pc-pickup{min-width:0}.pc-action{padding:8px 9px;font-size:13px!important}.pc-status{font-size:12px;padding:6px 7px}.pc-reports{font-size:12px}.pc-footer{padding:14px 20px}}
@media(max-width:800px){.sp-curation{gap:20px}.pc-header{gap:12px;padding:2px}.pc-header-icon{width:44px;height:44px;border-radius:14px}.pc-header h2{font-size:28px}.pc-header p{font-size:14px}.pc-toolbar{padding:20px 18px}.pc-controls{flex-direction:column;align-items:stretch;gap:10px}.pc-search{flex:auto;width:100%}.pc-filter select{width:100%}.pc-table tbody{grid-template-columns:1fr;padding:0 14px 16px;gap:12px}.pc-product-row{padding:18px}.pc-menu-title{font-size:16px}.pc-action{font-size:14px!important;padding:8px 11px}.pc-status{font-size:13px;padding:6px 9px}}
@media(prefers-reduced-motion:reduce){.sp-curation *{transition:none!important}}
`;

export const ProductCurationTab: React.FC<ProductCurationTabProps> = ({
  displayProducts, productMonitoring, productStatusFilter, onStatusFilterChange,
  searchQuery, onSearchChange, onRestoreProduct, onRequestTakedown,
}) => {
  const searchId = useId();
  const filterId = useId();
  const hasFilters = searchQuery.trim().length > 0 || productStatusFilter !== 'all';

  const changeStatus = (value: string) => {
    if (value === 'all' || value === 'Aktif & Aman' || value === 'Dalam Tinjauan' || value === 'Take Down') {
      onStatusFilterChange(value);
    }
  };

  const resetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
  };

  return (
    <div className="sp-curation">
      <style>{styles}</style>
      <header className="pc-header">
        <div className="pc-header-icon" aria-hidden="true"><Utensils size={23} strokeWidth={1.6} /></div>
        <div>
          <div className="pc-eyebrow">SisaPiring / Menu</div>
          <h2>Kelola menu</h2>
          <p>Pantau menu mitra dan tangani yang bermasalah.</p>
        </div>
      </header>

      <section className="pc-sheet" aria-label="Daftar menu">
        <div className="pc-toolbar">
          <div className="pc-list-title">Daftar menu</div>
          <div className="pc-controls">
            <div className="pc-search">
              <label htmlFor={searchId} className="pc-sr-only">Cari menu, mitra, atau kategori</label>
              <Search size={16} className="pc-search-icon" aria-hidden="true" />
              <input id={searchId} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari menu atau mitra…" />
              {searchQuery && <button type="button" className="pc-clear" aria-label="Hapus pencarian" onClick={() => onSearchChange('')}><X size={14} /></button>}
            </div>
            <div className="pc-filter">
              <label htmlFor={filterId} className="pc-sr-only">Filter status menu</label>
              <SlidersHorizontal size={14} className="pc-filter-icon" aria-hidden="true" />
              <select id={filterId} value={productStatusFilter} onChange={(e) => changeStatus(e.target.value)}>
                <option value="all">Semua status</option>
                <option value="Aktif & Aman">Aktif</option>
                <option value="Dalam Tinjauan">Dalam tinjauan</option>
                <option value="Take Down">Nonaktif</option>
              </select>
              <ChevronDown size={14} className="pc-filter-chevron" aria-hidden="true" />
            </div>
          </div>
        </div>

        {displayProducts.length > 0 ? (
          <div className="pc-table-scroll">
            <table className="pc-table" role="table">
              <caption className="pc-sr-only">Menu mitra, harga, stok, waktu ambil, status, dan tindakan</caption>
              <thead role="rowgroup"><tr role="row">
                <th scope="col" role="columnheader">Menu & mitra</th>
                <th scope="col" role="columnheader">Harga</th>
                <th scope="col" role="columnheader">Stok</th>
                <th scope="col" role="columnheader">Waktu ambil</th>
                <th scope="col" role="columnheader">Status</th>
                <th scope="col" role="columnheader">Tindakan</th>
              </tr></thead>
              <tbody role="rowgroup">
                {displayProducts.map((item) => {
                  const meta = productMonitoring[item.id];
                  const status = meta?.monitoringStatus ?? 'Aktif & Aman';
                  const reports = meta?.reportCount ?? 0;
                  const isTakenDown = status === 'Take Down';
                  const isReview = status === 'Dalam Tinjauan';
                  const statusLabel = isTakenDown ? 'Nonaktif' : isReview ? 'Dalam tinjauan' : 'Aktif';
                  const StatusIcon = isTakenDown ? Ban : isReview ? AlertTriangle : CheckCircle2;

                  return (
                    <tr key={item.id} role="row" className={`pc-product-row ${isTakenDown ? 'pc-inactive' : ''}`}>
                      <td role="cell">
                        <div className="pc-menu">
                          <div className="pc-photo"><ResilientImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div>
                          <div className="pc-menu-copy">
                            <div className="pc-menu-title" title={`${item.title} · ${item.category} · ID: ${item.id}`}>{item.title}</div>
                            <div className="pc-merchant">{item.merchantName}</div>
                            <div className="pc-district">{item.district}</div>
                          </div>
                        </div>
                      </td>
                      <td role="cell">
                        <span className="pc-mobile-label" aria-hidden="true">Harga</span>
                        <span className="pc-number pc-rescue-price"><span className="pc-sr-only">Harga hemat: </span>{formatRupiah(item.rescuePrice)}</span>
                        <span className="pc-number pc-original-price"><span className="pc-sr-only">Harga normal: </span>{formatRupiah(item.originalPrice)}</span>
                      </td>
                      <td role="cell">
                        <span className="pc-mobile-label" aria-hidden="true">Stok</span>
                        <span className="pc-stock"><span className="pc-number">{item.remainingStock.toLocaleString('id-ID')}</span><span className="pc-stock-unit">porsi</span></span>
                      </td>
                      <td role="cell">
                        <span className="pc-mobile-label" aria-hidden="true">Waktu ambil</span>
                        <div className="pc-pickup"><Clock size={16} aria-hidden="true" /><span>{item.pickupWindow}</span></div>
                      </td>
                      <td role="cell">
                        <span className={`pc-status ${isTakenDown ? 'pc-status-inactive' : isReview ? 'pc-status-review' : ''}`}>
                          <StatusIcon size={15} aria-hidden="true" />{statusLabel}
                        </span>
                        {reports > 0 && <span className="pc-reports">{reports.toLocaleString('id-ID')} laporan</span>}
                      </td>
                      <td role="cell">
                        {isTakenDown ? (
                          <button type="button" className="pc-action pc-action-restore" aria-label={`Pulihkan ${item.title}`} onClick={() => onRestoreProduct(item.id, item.title)}>
                            <RotateCcw size={16} aria-hidden="true" />Pulihkan
                          </button>
                        ) : (
                          <button type="button" className="pc-action" aria-label={`Nonaktifkan ${item.title}`} onClick={() => onRequestTakedown(item)}>
                            <Ban size={16} aria-hidden="true" />Nonaktifkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pc-empty">
            <div className="pc-empty-icon" aria-hidden="true">{hasFilters ? <Search size={22} /> : <Package size={22} />}</div>
            <div className="pc-empty-title">{hasFilters ? 'Menu tidak ditemukan' : 'Belum ada menu'}</div>
            <p>{hasFilters ? 'Coba kata kunci lain atau ubah filter status.' : 'Menu dari mitra akan muncul di sini.'}</p>
            {hasFilters && <button type="button" className="pc-reset" onClick={resetFilters}>Reset filter</button>}
          </div>
        )}
        <div className="pc-footer" role="status">{displayProducts.length.toLocaleString('id-ID')} menu ditampilkan</div>
      </section>
    </div>
  );
};