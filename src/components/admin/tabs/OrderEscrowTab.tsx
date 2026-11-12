import React from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
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

export const OrderEscrowTab: React.FC<OrderEscrowTabProps> = ({
  transactions,
  orders,
  searchQuery,
  onSearchChange,
  macroStats,
  onReleaseEscrow,
}) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Monitoring Pesanan & Rekening Escrow Platform
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Dana konsumen tertahan aman di rekening bersama (escrow) hingga verifikasi serah terima paket makanan via QR Code.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode pesanan, pembeli, toko..."
            className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-64"
          />
        </div>
      </div>

      {/* Escrow Health Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Total Transaksi Dipantau</span>
          <div className="text-xl font-black font-mono text-neutral-900">
            {transactions.length + orders.length} Pesanan
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">Real-time sinkron</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Dana Tertahan di Escrow</span>
          <div className="text-xl font-black font-mono text-amber-700">
            {formatRupiah(macroStats.totalEscrowHeld)}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold block">
            Menunggu verifikasi serah terima QR
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-neutral-500">Pencairan Dana (Settled)</span>
          <div className="text-xl font-black font-mono text-[#1F281A]">
            {formatRupiah(settledTotal)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Telah cair ke dompet UMKM
          </span>
        </div>
      </div>

      {/* Unified Orders & Escrow Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Kode Pesanan / Waktu</th>
                <th className="py-3 px-4">Pembeli (User)</th>
                <th className="py-3 px-4">Mitra UMKM (Penjual)</th>
                <th className="py-3 px-4">Menu & Porsi</th>
                <th className="py-3 px-4">Total Bayar & Metode</th>
                <th className="py-3 px-4">Status Rekening Escrow</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-neutral-900 block text-xs">
                      {trx.orderCode}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">{trx.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-800 block text-xs">{trx.buyerName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-neutral-800 block text-xs">
                      {trx.merchantName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-neutral-900 font-semibold block text-xs line-clamp-1">
                      {trx.quantity}x {trx.itemTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold font-mono text-[#1F281A] block text-xs">
                      {formatRupiah(trx.totalPaid)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">{trx.paymentMethod}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${trx.gatewayStatus === 'Selesai (Settled)'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trx.gatewayStatus === 'Dana Ditahan (Escrow)'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                    >
                      {trx.gatewayStatus === 'Selesai (Settled)' && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      )}
                      {trx.gatewayStatus === 'Dana Ditahan (Escrow)' && (
                        <Clock className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{trx.gatewayStatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {trx.gatewayStatus === 'Dana Ditahan (Escrow)' ? (
                      <button
                        type="button"
                        onClick={() => onReleaseEscrow(trx)}
                        className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                      >
                        Lepaskan Dana
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">Beres</span>
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

