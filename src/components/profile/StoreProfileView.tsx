import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { BANDUNG_DISTRICTS } from '../../data/bandungDistricts';
import { BandungDistrict, ProductCategory } from '../../types/seller';
import { useApp } from '../../context/AppContext';

export const StoreProfileView: React.FC = () => {
  const { sellerProfile, updateSellerProfile, showToast } = useApp();

  const [businessName, setBusinessName] = useState(sellerProfile.businessName);
  const [ownerName, setOwnerName] = useState(sellerProfile.ownerName);
  const [ownerPhone, setOwnerPhone] = useState(sellerProfile.ownerPhone);
  const [ownerEmail, setOwnerEmail] = useState(sellerProfile.ownerEmail);
  const [businessCategory, setBusinessCategory] = useState<ProductCategory>(sellerProfile.businessCategory);
  const [district, setDistrict] = useState<BandungDistrict>(sellerProfile.district);
  const [businessAddress, setBusinessAddress] = useState(sellerProfile.businessAddress);
  const [operatingHours, setOperatingHours] = useState(sellerProfile.operatingHours);
  const [pickupWindow, setPickupWindow] = useState(sellerProfile.pickupWindow);
  const [storeBio, setStoreBio] = useState(sellerProfile.storeBio);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerProfile({
      businessName,
      ownerName,
      ownerPhone,
      ownerEmail,
      businessCategory,
      district,
      businessAddress,
      operatingHours,
      pickupWindow,
      storeBio,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#16382C] tracking-tight">
          Profil Usaha UMKM
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Identitas bisnis kuliner Anda yang tampil pada aplikasi pembeli SisaPiring Kota Bandung.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Storefront Hero Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="relative h-44 sm:h-52 bg-neutral-100">
            <img
              src={sellerProfile.businessPhoto}
              alt={sellerProfile.businessName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-semibold text-[#FFD230] uppercase tracking-wider block">
                {sellerProfile.businessCategory}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">{businessName}</h2>
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Kec. {district}, Kota Bandung</span>
              </p>
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Brand Kuliner UMKM
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kategori Kuliner
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
                >
                  <option value="Bakery & Roti">Bakery & Roti</option>
                  <option value="Katering & Nasi Kotak">Katering & Nasi Kotak</option>
                  <option value="Cafe & Minuman">Cafe & Minuman</option>
                  <option value="Kue & Pastry">Kue & Pastry</option>
                  <option value="Resto & Makanan Berat">Resto & Makanan Berat</option>
                  <option value="Buah & Sayur Segar">Buah & Sayur Segar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kecamatan di Kota Bandung
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as BandungDistrict)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
                >
                  {BANDUNG_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      Kec. {d.name} ({d.popularArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Jadwal Penjemputan Makanan (Pickup Window)
                </label>
                <input
                  type="text"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  placeholder="Contoh: 18:00 - 21:30 WIB"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Alamat Lengkap Toko / Dapur
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Bio Singkat & Komitmen Zero Food Waste
                </label>
                <textarea
                  rows={3}
                  value={storeBio}
                  onChange={(e) => setStoreBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Owner Details Card */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#16382C]">Kontak Penanggung Jawab Usaha</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nama Pemilik / Manager
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                WhatsApp Aktif
              </label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Terdaftar
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#16382C] hover:bg-[#214F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <Save className="w-4 h-4 text-[#FFD230]" />
            <span>Simpan Perubahan Profil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
