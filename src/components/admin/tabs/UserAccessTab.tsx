import React from 'react';
import { Plus } from 'lucide-react';
import { UserAccessRecord, UserRole } from '../../../data/adminData';

interface UserAccessTabProps {
  displayUsers: UserAccessRecord[];
  roleFilter: 'all' | UserRole;
  onRoleFilterChange: (role: 'all' | UserRole) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddUserModal: () => void;
  onToggleUserStatus: (u: UserAccessRecord) => void;
}

export const UserAccessTab: React.FC<UserAccessTabProps> = ({
  displayUsers,
  roleFilter,
  onRoleFilterChange,
  searchQuery,
  onSearchChange,
  onOpenAddUserModal,
  onToggleUserStatus,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Manajemen Akun & Hak Akses (RBAC)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Daftar akun konsumen (buyer), mitra UMKM (seller), dan admin platform Kota Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddUserModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16382C] hover:bg-[#214F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun Demo</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Wilayah Kecamatan</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Kontrol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {displayUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-900 block text-xs">{u.name}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">{u.id}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-neutral-800 block text-xs">{u.email}</span>
                    <span className="text-[11px] text-neutral-500 block font-mono">{u.phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'Admin'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'UMKM'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">{u.district}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'Peringatan (Warning)'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.status === 'Aktif' ? (
                      <button
                        type="button"
                        onClick={() => onToggleUserStatus(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 cursor-pointer"
                      >
                        Bekukan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleUserStatus(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                      >
                        Aktifkan
                      </button>
                    )}
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

