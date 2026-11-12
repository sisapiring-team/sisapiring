import React, { useId } from 'react';
import {
  Store, Search, CheckCircle2, Clock, Ban, Eye, X, ChevronDown,
  SlidersHorizontal, MapPin, Phone, User, FileCheck2, ExternalLink, ArrowUpRight, AlertCircle,
} from 'lucide-react';
import { ResilientImage } from '../../ResilientImage';
import {
  UmkmVerificationRecord,
  UmkmVerificationStatus,
} from '../../../data/adminData';
import { SellerProfile } from '../../../types/seller';

interface SellerGovernanceTabProps {
  displayUmkmList: UmkmVerificationRecord[];
  sellerStatusFilter: 'all' | UmkmVerificationStatus;
  onStatusFilterChange: (status: 'all' | UmkmVerificationStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sellerProfile: SellerProfile;
  onSelectUmkm: (umkm: UmkmVerificationRecord) => void;
  onOpenPublicStore: (storeName: string) => void;
  onSwitchToSellerPortal?: () => void;
}

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

/* Header */
.sg-header{display:flex;align-items:center;gap:16px}
.sg-header-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:var(--sg-soft);color:#6a8338;border:1px solid #dce6cb}
.sg-eyebrow{font-size:13px;font-weight:600;color:#6b7d59;margin-bottom:2px}
.sg-header h2{font-family:'Plus Jakarta Sans','Avenir Next',system-ui,sans-serif;font-size:28px;font-weight:700;letter-spacing:-.5px;line-height:1.3}
.sg-header p{color:var(--sg-muted);font-size:15px;margin-top:2px}

/* Active store banner */
.sg-banner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:22px 24px;border-radius:18px;background:#2f3d27;color:#fff}
.sg-banner-main{display:flex;align-items:center;gap:16px;min-width:0}
.sg-banner-icon{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.12);display:grid;place-items:center;color:#e7d58a;flex-shrink:0}
.sg-banner-title{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sg-banner h3{font-size:18px;font-weight:700;line-height:1.4;overflow-wrap:anywhere}
.sg-chip{border-radius:999px;background:#e9d98f;color:#3b3410;font-size:13px;font-weight:600;padding:3px 12px}
.sg-banner-info{margin-top:6px!important;display:flex;flex-wrap:wrap;gap:4px 20px;font-size:14px;color:#d9e5cb}
.sg-banner-actions{display:flex;gap:10px;flex-wrap:wrap}
.sg-btn-light,.sg-btn-solid{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border-radius:12px;padding:10px 18px;font-size:15px;font-weight:600;transition:background .18s}
.sg-btn-light{border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff}
.sg-btn-light:hover{background:rgba(255,255,255,.12)}
.sg-btn-solid{border:1px solid #8aa356;background:#8aa356;color:#1f2b16}
.sg-btn-solid:hover{background:#9bb566}

/* Toolbar */
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

/* Cards */
.sg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}
.sg-card{min-width:0;border:1px solid var(--sg-line);background:#fff;border-radius:18px;overflow:hidden;transition:box-shadow .2s,border-color .2s}
.sg-card:hover{border-color:#d3dcc4;box-shadow:0 6px 20px rgba(40,53,41,.06)}
.sg-card-body{padding:24px}
.sg-card-top{display:flex;align-items:flex-start;gap:16px}
.sg-photo{width:64px;height:64px;border-radius:14px;object-fit:cover;border:1px solid var(--sg-line);flex-shrink:0;background:var(--sg-bg)}
.sg-card-title{min-width:0;flex:1}
.sg-card h3{font-size:19px;font-weight:700;letter-spacing:-.2px;line-height:1.4;overflow-wrap:anywhere}
.sg-category{font-size:15px;color:var(--sg-muted);margin-top:2px!important;overflow-wrap:anywhere}
.sg-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600;line-height:1.4;margin-top:10px;background:#f2f4ed;color:#53624a;max-width:100%}
.sg-status svg{flex-shrink:0}
.sg-status-verified{background:#e9f2de;color:#47651f}
.sg-status-pending{background:#fff3dc;color:#7a5614}
.sg-status-suspended{background:#f8e9e2;color:#8a4a33}
.sg-status-rejected{background:#eceee8;color:#4f5a47}

.sg-facts{display:grid;gap:12px;margin-top:20px!important}
.sg-fact{display:flex;align-items:flex-start;gap:12px;background:var(--sg-bg);border-radius:12px;padding:12px 14px;min-width:0}
.sg-fact svg{color:#6f8a3d;flex-shrink:0;margin-top:3px}
.sg-fact dt{font-size:13px;color:var(--sg-muted);line-height:1.4}
.sg-fact dd{font-size:15px;font-weight:600;color:var(--sg-ink);line-height:1.5;margin-top:2px!important;overflow-wrap:anywhere}
.sg-fact dd small{display:block;font-size:14px;font-weight:500;color:var(--sg-text);margin-top:2px}
.sg-legal{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.sg-legal-item{background:var(--sg-soft);border-radius:12px;padding:12px 14px;min-width:0}
.sg-legal-item dt{font-size:13px;color:#4b6329;font-weight:600}
.sg-legal-item dd{font-family:'SFMono-Regular',Consolas,monospace;font-size:14px;font-weight:600;color:#33481a;margin-top:2px!important;overflow-wrap:anywhere}

.sg-actions{padding:16px 24px;border-top:1px solid #edf0e7;background:#fbfcf8}
.sg-primary{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:12px;border:1px solid var(--sg-green);background:var(--sg-green);color:#fff;font-size:15px;font-weight:600;padding:10px 18px;transition:background .18s}
.sg-primary:hover{background:var(--sg-green-dark);border-color:var(--sg-green-dark)}

/* Empty */
.sg-empty{border:1px dashed #d3dcc4;background:#fff;border-radius:18px;text-align:center;padding:56px 24px}
.sg-empty-icon{width:56px;height:56px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--sg-soft);color:#6a8338}
.sg-empty h3{font-size:20px;margin-bottom:6px}
.sg-empty p{font-size:15px;color:var(--sg-muted)}
.sg-reset{margin-top:20px;border:1px solid #cfdcb9;background:#f0f5e8;color:#4b6529;border-radius:12px;padding:10px 20px;min-height:44px;font-size:15px;font-weight:600}
.sg-reset:hover{background:#e6eed9}

@media(max-width:1100px){
  .sg-grid{grid-template-columns:1fr}
  .sg-toolbar{align-items:stretch;flex-direction:column}
  .sg-controls{width:100%}
  .sg-search{flex:1;width:auto}
}
@media(max-width:600px){
  .sp-seller{gap:20px}
  .sg-header{gap:12px}
  .sg-header-icon{width:46px;height:46px;border-radius:14px}
  .sg-header h2{font-size:24px}
  .sg-header p{font-size:14px}
  .sg-banner{padding:20px 18px}
  .sg-banner-actions{width:100%}
  .sg-banner-actions button{flex:1;min-width:100%}
  .sg-toolbar{padding:16px}
  .sg-controls{flex-direction:column;align-items:stretch}
  .sg-search{width:100%;flex:auto}
  .sg-filter select{width:100%}
  .sg-card-body{padding:20px 18px}
  .sg-card h3{font-size:18px}
  .sg-actions{padding:16px 18px}
  .sg-legal{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){.sp-seller *{transition:none!important}}
`;

const statusConfig = (status: UmkmVerificationStatus) => {
  switch (status) {
    case 'Verified':
      return { cls: 'sg-status-verified', Icon: CheckCircle2, label: 'Terverifikasi' };
    case 'Menunggu Verifikasi':
      return { cls: 'sg-status-pending', Icon: Clock, label: 'Menunggu verifikasi' };
    case 'Suspended':
      return { cls: 'sg-status-suspended', Icon: Ban, label: 'Dibekukan' };
    default:
      return { cls: 'sg-status-rejected', Icon: AlertCircle, label: 'Perlu perbaikan' };
  }
};

const UmkmCard = ({
  umkm, onSelectUmkm,
}: Pick<SellerGovernanceTabProps, 'onSelectUmkm'> & { umkm: UmkmVerificationRecord }) => {
  const headingId = useId();
  const { cls, Icon, label } = statusConfig(umkm.status);

  return (
    <article className="sg-card" aria-labelledby={headingId}>
      <div className="sg-card-body">
        <div className="sg-card-top">
          <ResilientImage src={umkm.storePhotoUrl} alt={umkm.storeName} className="sg-photo" />
          <div className="sg-card-title">
            <h3 id={headingId}>{umkm.storeName}</h3>
            <p className="sg-category">{umkm.category}</p>
            <span className={`sg-status ${cls}`}><Icon size={15} aria-hidden="true" />{label}</span>
          </div>
        </div>

        <dl className="sg-facts">
          <div className="sg-fact">
            <User size={17} aria-hidden="true" />
            <div><dt>Pemilik</dt><dd>{umkm.ownerName}</dd></div>
          </div>
          <div className="sg-fact">
            <Phone size={17} aria-hidden="true" />
            <div><dt>Kontak</dt><dd>{umkm.phone}</dd></div>
          </div>
          <div className="sg-fact">
            <MapPin size={17} aria-hidden="true" />
            <div><dt>Lokasi</dt><dd>{umkm.district}<small>{umkm.address}</small></dd></div>
          </div>
        </dl>

        <dl className="sg-legal">
          <div className="sg-legal-item"><dt>Nomor NIB</dt><dd>{umkm.nibNumber}</dd></div>
          <div className="sg-legal-item"><dt>Halal / PIRT</dt><dd>{umkm.halalOrPirtNumber}</dd></div>
        </dl>
      </div>

      <div className="sg-actions">
        <button
          type="button"
          className="sg-primary"
          aria-label={`Tinjau legalitas ${umkm.storeName}`}
          onClick={() => onSelectUmkm(umkm)}
        >
          <Eye size={18} aria-hidden="true" />Tinjau legalitas
        </button>
      </div>
    </article>
  );
};

export const SellerGovernanceTab: React.FC<SellerGovernanceTabProps> = ({
  displayUmkmList,
  sellerStatusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  sellerProfile,
  onSelectUmkm,
  onOpenPublicStore,
  onSwitchToSellerPortal,
}) => {
  const searchId = useId();
  const filterId = useId();
  const hasFilters = searchQuery.trim().length > 0 || sellerStatusFilter !== 'all';

  const changeStatus = (value: string) => {
    if (value === 'all' || value === 'Menunggu Verifikasi' || value === 'Verified' || value === 'Ditolak' || value === 'Suspended') {
      onStatusFilterChange(value as 'all' | UmkmVerificationStatus);
    }
  };

  return (
    <div className="sp-seller">
      <style>{styles}</style>

      <header className="sg-header">
        <div className="sg-header-icon" aria-hidden="true"><FileCheck2 size={24} strokeWidth={1.7} /></div>
        <div>
          <div className="sg-eyebrow">SisaPiring · Mitra UMKM</div>
          <h2>Tata kelola mitra</h2>
          <p>Periksa kelengkapan izin usaha dan atur status toko mitra.</p>
        </div>
      </header>

      <section className="sg-banner" aria-label="Toko demo aktif">
        <div className="sg-banner-main">
          <div className="sg-banner-icon" aria-hidden="true"><Store size={26} /></div>
          <div>
            <div className="sg-banner-title">
              <h3>{sellerProfile.businessName}</h3>
              <span className="sg-chip">Toko demo aktif</span>
            </div>
            <div className="sg-banner-info">
              <span>Pemilik: {sellerProfile.ownerName}</span>
              <span>Kec. {sellerProfile.district}</span>
              <span>Ambil: {sellerProfile.pickupWindow}</span>
            </div>
          </div>
        </div>
        <div className="sg-banner-actions">
          <button type="button" className="sg-btn-light" onClick={() => onOpenPublicStore(sellerProfile.businessName)}>
            Lihat profil publik<ExternalLink size={16} aria-hidden="true" />
          </button>
          <button type="button" className="sg-btn-solid" onClick={onSwitchToSellerPortal}>
            Buka portal penjual<ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </section>

      <div className="sg-toolbar">
        <div className="sg-list-label">
          Daftar mitra
          <span className="sg-count" role="status">{displayUmkmList.length.toLocaleString('id-ID')} mitra ditampilkan</span>
        </div>
        <div className="sg-controls">
          <div className="sg-search">
            <label htmlFor={searchId} className="sg-sr-only">Cari toko, NIB, atau pemilik</label>
            <Search size={18} className="sg-search-icon" aria-hidden="true" />
            <input id={searchId} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari toko, NIB, pemilik…" />
            {searchQuery && (
              <button type="button" className="sg-clear" aria-label="Hapus pencarian" onClick={() => onSearchChange('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="sg-filter">
            <label htmlFor={filterId} className="sg-sr-only">Filter status verifikasi</label>
            <SlidersHorizontal size={16} className="sg-filter-icon" aria-hidden="true" />
            <select id={filterId} value={sellerStatusFilter} onChange={(e) => changeStatus(e.target.value)}>
              <option value="all">Semua status</option>
              <option value="Menunggu Verifikasi">Menunggu verifikasi</option>
              <option value="Verified">Terverifikasi</option>
              <option value="Ditolak">Perlu perbaikan</option>
              <option value="Suspended">Dibekukan</option>
            </select>
            <ChevronDown size={16} className="sg-filter-chevron" aria-hidden="true" />
          </div>
        </div>
      </div>

      {displayUmkmList.length > 0 ? (
        <div className="sg-grid">
          {displayUmkmList.map((umkm) => (
            <UmkmCard key={umkm.id} umkm={umkm} onSelectUmkm={onSelectUmkm} />
          ))}
        </div>
      ) : (
        <div className="sg-empty">
          <div className="sg-empty-icon" aria-hidden="true">{hasFilters ? <Search size={24} /> : <Store size={24} />}</div>
          <h3>{hasFilters ? 'Mitra tidak ditemukan' : 'Belum ada mitra'}</h3>
          <p>{hasFilters ? 'Coba kata kunci lain atau ubah filter.' : 'Mitra UMKM yang mendaftar akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" className="sg-reset" onClick={() => { onSearchChange(''); onStatusFilterChange('all'); }}>
              Reset filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};