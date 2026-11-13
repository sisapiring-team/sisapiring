import React, { useId, useState } from 'react';
import {
  ArrowUpRight, ChevronDown, Download, Info, Leaf, MapPin,
  MessageSquare, ShoppingBag, Store, Utensils, ShieldCheck,
} from 'lucide-react';
import type { AdminTab, AdminMacroStats } from '../types';
import type { UmkmVerificationRecord } from '../../../data/adminData';

interface OverviewTabProps {
  macroStats: AdminMacroStats;
  umkmVerifications: UmkmVerificationRecord[];
  onSelectTab: (tab: AdminTab) => void;
  onExportCSV: () => void;
  onFilterPendingUmkm: () => void;
}

const styles = `
.sp-overview{--sp-ink:#283529;--sp-muted:#737d73;--sp-olive:#789044;--sp-line:#e7ebe3;color:var(--sp-ink);font-family:inherit;display:grid;gap:24px;max-width:1320px;margin:0 auto}
.sp-overview,.sp-overview *{box-sizing:border-box}
.sp-overview h2,.sp-overview h3,.sp-overview p{margin:0}
.sp-overview button{font:inherit;cursor:pointer}
.sp-overview button:focus-visible{outline:3px solid #789044;outline-offset:4px}
.sp-hero{position:relative;overflow:hidden;border:1px solid #dce5cc;background:#edf2e4;border-radius:24px;padding:32px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:184px}
.sp-hero-copy{position:relative;z-index:1}
.sp-eyebrow{display:flex;align-items:center;flex-wrap:wrap;gap:10px;color:#667950;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.sp-eyebrow-divider{width:1px;height:12px;background:#bac9a9}
.sp-hero h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:clamp(25px,3vw,34px);line-height:1.2;font-weight:750;letter-spacing:-1.2px}
.sp-hero p{margin-top:10px;font-size:13px;line-height:1.6;color:#69765d}
.sp-export{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:9px;flex-shrink:0;background:#2f412a;border:1px solid #2f412a;color:white;padding:13px 18px;border-radius:12px;font-size:12px!important;font-weight:650!important;box-shadow:0 4px 10px #2f412a12;transition:background .18s,transform .18s}
.sp-export:hover{background:#435936;transform:translateY(-1px)}
.sp-plate{position:absolute;width:238px;height:238px;right:175px;bottom:-132px;border:1px solid #b6c59b60;border-radius:50%;box-shadow:0 0 0 24px #b6c59b18,0 0 0 48px #b6c59b0c;pointer-events:none}
.sp-plate svg{position:absolute;left:88px;top:22px;color:#94a971;transform:rotate(-28deg)}
.sp-workspace{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.sp-panel{border:1px solid var(--sp-line);border-radius:20px;background:#fff;overflow:hidden;box-shadow:0 3px 12px #28352903}
.sp-panel-head{padding:24px 24px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.sp-panel-title{display:flex;align-items:center;gap:12px}
.sp-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:#f1f4e9;color:#71873f;flex-shrink:0}
.sp-icon-buyer{background:#fcf2df;color:#b58939}
.sp-panel h3,.sp-district h3{font-size:16px;font-weight:700;letter-spacing:-.3px}
.sp-caption{display:block;font-size:11px;line-height:1.5;color:var(--sp-muted);margin-top:4px}
.sp-text-button{display:inline-flex;align-items:center;gap:5px;flex-shrink:0;border:0;background:none;color:#69823c;font-size:11px!important;font-weight:650!important;padding:7px 0;transition:color .18s}
.sp-text-button:hover{color:#344b20}
.sp-rows{padding:0 24px 8px}
.sp-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;border-top:1px solid #f0f2ed;min-height:77px}
.sp-row-title{font-size:12px;font-weight:600;line-height:1.5}
.sp-row-detail{font-size:11px;color:var(--sp-muted);margin-top:4px;line-height:1.5}
.sp-row-end{display:flex;align-items:center;gap:9px;flex-shrink:0}
.sp-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:600;white-space:nowrap;padding:6px 9px;border-radius:7px;background:#eef4e7;color:#617d38}
.sp-badge-warn{background:#fff4dd;color:#a27625}
.sp-badge-danger{background:#fff0ed;color:#b56c56}
.sp-review-button{background:#f7f0e2;color:#946e2b;border:1px solid #eee0c5;padding:7px 11px;border-radius:8px;font-size:11px!important;font-weight:650!important;transition:background .18s}
.sp-review-button:hover{background:#f0e3c8}
.sp-district{background:#fff;border:1px solid var(--sp-line);border-radius:20px;overflow:hidden}
.sp-district-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:24px 26px 20px}
.sp-region{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--sp-muted);white-space:nowrap}
.sp-table-scroll{overflow-x:auto}
.sp-table{width:100%;border-collapse:collapse;text-align:left;font-size:12px;white-space:nowrap}
.sp-table th{padding:13px 26px;background:#f8faf6;color:#889080;font-size:10px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;border-block:1px solid #edf0e9}
.sp-table td{padding:18px 26px;border-bottom:1px solid #f0f2ed}
.sp-table tr:last-child td{border-bottom:0}
.sp-table tbody tr:hover{background:#fbfcf9}
.sp-table th:not(:first-child),.sp-table td:not(:first-child){text-align:right}
.sp-district-name{display:flex;align-items:center;gap:10px;font-weight:600}
.sp-map-icon{color:#a0af89;flex-shrink:0}
.sp-number{font-family:'SFMono-Regular',Consolas,monospace;font-variant-numeric:tabular-nums;font-size:12px}
.sp-portions{color:#678039;font-weight:700}
.sp-empty{text-align:center!important;color:var(--sp-muted);white-space:normal;padding:30px!important}
.sp-method{border:1px solid var(--sp-line);border-radius:14px;background:#f8faf6;overflow:hidden}
.sp-method-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:16px 20px;background:none;border:0;color:#737f68;text-align:left;font-size:11px!important}
.sp-method-label{display:flex;align-items:center;gap:9px}
.sp-method-toggle:hover{background:#f0f4e9}
.sp-chevron{transition:transform .2s;flex-shrink:0}
.sp-chevron-open{transform:rotate(180deg)}
.sp-formulas{border-top:1px solid var(--sp-line);padding:18px 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.sp-formula-title{font-size:11px;font-weight:650;margin-bottom:6px;color:#556445}
.sp-formula-value{font-size:11px;color:var(--sp-muted);line-height:1.6}
@media(min-width:1100px){.sp-hero{padding:36px 40px}}
@media(max-width:720px){.sp-workspace{grid-template-columns:1fr}.sp-hero{padding:26px;align-items:flex-start;flex-direction:column;gap:20px}.sp-hero h2{letter-spacing:-.8px}.sp-plate{right:-70px;bottom:-105px}.sp-panel-head{padding:20px}.sp-rows{padding:0 20px 6px}.sp-district-head{padding:20px}.sp-table th,.sp-table td{padding:15px 20px}.sp-formulas{grid-template-columns:1fr;gap:16px}.sp-overview{gap:18px}}
@media(max-width:380px){.sp-panel-head{gap:8px;padding:18px 16px}.sp-rows{padding-inline:16px}.sp-panel-title{gap:8px}.sp-icon{width:34px;height:34px}.sp-panel h3{font-size:14px}.sp-row{gap:8px}.sp-badge{font-size:9px;padding:5px 7px}.sp-region{display:none}}
@media(prefers-reduced-motion:reduce){.sp-overview *{transition:none!important}.sp-export:hover{transform:none}}
`;

interface ActionRowProps {
  title: string;
  detail?: string;
  children: React.ReactNode;
}

const ActionRow = ({ title, detail, children }: ActionRowProps) => (
  <div className="sp-row">
    <div>
      <div className="sp-row-title">{title}</div>
      {detail && <div className="sp-row-detail">{detail}</div>}
    </div>
    <div className="sp-row-end">{children}</div>
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({
  macroStats, umkmVerifications, onSelectTab, onExportCSV, onFilterPendingUmkm,
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const methodologyId = useId();
  const verifiedCount = umkmVerifications.filter((u) => u.status === 'Verified').length;
  const districts = macroStats.period.districtStats;

  return (
    <div className="sp-overview">
      <style>{styles}</style>
      <header className="sp-hero">
        <div className="sp-hero-copy">
          <div className="sp-eyebrow">
            <span>SisaPiring / Admin</span>
            <span className="sp-eyebrow-divider" aria-hidden="true" />
            <span>{macroStats.period.periodLabel}</span>
          </div>
          <h2>Ringkasan SisaPiring</h2>
          <p>Pantau mitra, pesanan, dan komplain dalam satu tempat.</p>
        </div>
        <div className="sp-plate" aria-hidden="true"><Leaf size={48} strokeWidth={1} /></div>
        <button type="button" className="sp-export" onClick={onExportCSV}>
          <Download size={16} strokeWidth={1.8} /> Unduh laporan
        </button>
      </header>

      <div className="sp-workspace">
        <section className="sp-panel" aria-label="Mitra UMKM">
          <div className="sp-panel-head">
            <div className="sp-panel-title">
              <div className="sp-icon"><Store size={20} strokeWidth={1.7} aria-hidden="true" /></div>
              <div><h3>Mitra UMKM</h3><span className="sp-caption">Gerai & menu</span></div>
            </div>
            <button type="button" className="sp-text-button" onClick={() => onSelectTab('seller-governance')}>
              Kelola mitra <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="sp-rows">
            <ActionRow title="Mitra terverifikasi" detail={`${verifiedCount.toLocaleString('id-ID')} gerai`}>
              <span className="sp-badge"><ShieldCheck size={12} aria-hidden="true" /> Terverifikasi</span>
            </ActionRow>
            <ActionRow title="Menunggu verifikasi" detail={`${macroStats.pendingUmkmCount.toLocaleString('id-ID')} mitra`}>
              <button type="button" className="sp-review-button" onClick={onFilterPendingUmkm}>Tinjau mitra</button>
            </ActionRow>
            <ActionRow title="Menu aktif" detail={`${macroStats.activeProductsCount.toLocaleString('id-ID')} menu`}>
              <button type="button" className="sp-text-button" onClick={() => onSelectTab('product-curation')}>
                Lihat menu <Utensils size={13} aria-hidden="true" />
              </button>
            </ActionRow>
          </div>
        </section>

        <section className="sp-panel" aria-label="Pembeli">
          <div className="sp-panel-head">
            <div className="sp-panel-title">
              <div className="sp-icon sp-icon-buyer"><ShoppingBag size={20} strokeWidth={1.7} aria-hidden="true" /></div>
              <div><h3>Pembeli</h3><span className="sp-caption">Pesanan & ulasan</span></div>
            </div>
            <button type="button" className="sp-text-button" onClick={() => onSelectTab('disputes-refund')}>
              Lihat komplain <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="sp-rows">
            <ActionRow title="Total pesanan" detail={`${macroStats.totalOrdersCount.toLocaleString('id-ID')} pesanan`}>
              <button type="button" className="sp-text-button" onClick={() => onSelectTab('order-escrow')}>
                Lihat pesanan <ArrowUpRight size={13} />
              </button>
            </ActionRow>
            <ActionRow title="Komplain terbuka" detail={`${macroStats.openDisputesCount.toLocaleString('id-ID')} tiket`}>
              <span className={`sp-badge ${macroStats.openDisputesCount > 0 ? 'sp-badge-danger' : ''}`}>
                {macroStats.openDisputesCount > 0 ? 'Perlu ditangani' : 'Tidak ada komplain'}
              </span>
            </ActionRow>
            <ActionRow title="Ulasan pembeli" detail="Cek masukan pembeli">
              <button type="button" className="sp-text-button" onClick={() => onSelectTab('reviews-moderation')}>
                Lihat ulasan <MessageSquare size={13} aria-hidden="true" />
              </button>
            </ActionRow>
          </div>
        </section>
      </div>

      <section className="sp-district" aria-label="Dampak per kecamatan">
        <div className="sp-district-head">
          <div><h3>Dampak per kecamatan</h3><span className="sp-caption">Penyelamatan pangan di Bandung</span></div>
          <span className="sp-region"><MapPin size={13} aria-hidden="true" /> Kota Bandung</span>
        </div>
        <div className="sp-table-scroll" role="region" aria-label="Tabel dampak per kecamatan" tabIndex={0}>
          <table className="sp-table">
            <thead><tr>
              <th scope="col">Kecamatan</th><th scope="col">Porsi diselamatkan</th>
              <th scope="col">Sampah dicegah (kg)</th><th scope="col">Mitra aktif</th>
            </tr></thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d.district}>
                  <td><div className="sp-district-name"><MapPin size={14} className="sp-map-icon" aria-hidden="true" />{d.district}</div></td>
                  <td className="sp-number sp-portions">{d.portionsRescued.toLocaleString('id-ID')}</td>
                  <td className="sp-number">{d.wasteReducedKg.toLocaleString('id-ID')}</td>
                  <td className="sp-number">{d.activeUmkm.toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {districts.length === 0 && <tr><td colSpan={4} className="sp-empty">Belum ada data untuk periode ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sp-method" aria-label="Metode perhitungan">
        <button type="button" className="sp-method-toggle" aria-expanded={showMethodology} aria-controls={methodologyId} onClick={() => setShowMethodology((previous) => !previous)}>
          <span className="sp-method-label"><Info size={15} aria-hidden="true" />Cara menghitung dampak</span>
          <ChevronDown size={15} className={`sp-chevron ${showMethodology ? 'sp-chevron-open' : ''}`} aria-hidden="true" />
        </button>
        {showMethodology && <div id={methodologyId} className="sp-formulas">
          <div><div className="sp-formula-title">Sampah dicegah</div><p className="sp-formula-value">Estimasi: porsi × 0,45 kg</p></div>
          <div><div className="sp-formula-title">Emisi berkurang</div><p className="sp-formula-value">Estimasi: sampah (kg) × 2,5 kg CO₂e</p></div>
          <div><div className="sp-formula-title">Jejak air pangan</div><p className="sp-formula-value">Estimasi: sampah (kg) × 800 liter</p></div>
        </div>}
      </section>
    </div>
  );
};