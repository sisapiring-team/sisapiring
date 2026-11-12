import React from 'react';
import {
  Store,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Eye,
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
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Tata Kelola Mitra UMKM (Kebutuhan Penjual)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verifikasi legalitas NIB, sertifikasi Halal / PIRT, komitmen higienitas dapur, dan kontrol status toko.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari toko, NIB, pemilik..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
            />
          </div>

          <select
            value={sellerStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Verified">Verified (Resmi)</option>
            <option value="Ditolak">Ditolak / Perbaikan</option>
            <option value="Suspended">Suspended (Dibekukan)</option>
          </select>
        </div>
      </div>

      {/* Active Store Focus Banner (Kala Bakehouse) */}
      <div className="bg-[#1F281A] text-white p-5 rounded-3xl border border-emerald-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 font-bold shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {sellerProfile.businessName} (Toko Demo Aktif)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-neutral-950">
                Sinkron Portal Seller
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Pemilik: {sellerProfile.ownerName} • Wilayah: Kec. {sellerProfile.district} • Operasional:{' '}
              {sellerProfile.pickupWindow}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenPublicStore(sellerProfile.businessName)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Lihat Profil Publik
          </button>
          <button
            type="button"
            onClick={onSwitchToSellerPortal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Buka di Portal Penjual
          </button>
        </div>
      </div>

      {/* List of Registered UMKM Partners */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Nama Gerai UMKM</th>
                <th className="py-3 px-4">Pemilik & Kontak</th>
                <th className="py-3 px-4">Legalitas (NIB / Halal)</th>
                <th className="py-3 px-4">Lokasi Bandung</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {displayUmkmList.map((umkm) => (
                <tr key={umkm.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ResilientImage
                        src={umkm.storePhotoUrl}
                        alt={umkm.storeName}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block text-xs">
                          {umkm.storeName}
                        </span>
                        <span className="text-[11px] text-neutral-400 block">{umkm.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-neutral-800 block">{umkm.ownerName}</span>
                    <span className="text-[11px] text-neutral-500 block font-mono">{umkm.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-neutral-800 font-bold block text-[11px]">
                      NIB: {umkm.nibNumber}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Halal: {umkm.halalOrPirtNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-neutral-800 block">{umkm.district}</span>
                    <span className="text-[11px] text-neutral-400 block line-clamp-1">{umkm.address}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${umkm.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : umkm.status === 'Menunggu Verifikasi'
                            ? 'bg-amber-100 text-amber-800'
                            : umkm.status === 'Suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-neutral-100 text-neutral-700'
                        }`}
                    >
                      {umkm.status === 'Verified' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                      {umkm.status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-700" />}
                      {umkm.status === 'Suspended' && <Ban className="w-3 h-3 text-rose-700" />}
                      <span>{umkm.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectUmkm(umkm)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Tinjau Legalitas</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

