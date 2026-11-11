import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UserRole } from '../../../data/adminData';

interface AddUserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    district: string;
  }) => void;
}

export const AddUserAccountModal: React.FC<AddUserAccountModalProps> = ({
  isOpen,
  onClose,
  onSaveUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Buyer');
  const [district, setDistrict] = useState('Coblong (Dago / Dipatiukur)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveUser({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@sisapiring.id`,
      phone: phone.trim() || '+62 812-8899-7711',
      role,
      district,
    });

    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="font-extrabold text-sm text-neutral-900">Tambah Akun Pengguna Demo</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Budi Santoso"
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@example.com"
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Peran (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold cursor-pointer"
              >
                <option value="Buyer">Buyer (Konsumen)</option>
                <option value="UMKM">UMKM (Penjual)</option>
                <option value="Admin">Admin Platform</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Wilayah Kecamatan</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#16382C] hover:bg-[#214F3F] text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

