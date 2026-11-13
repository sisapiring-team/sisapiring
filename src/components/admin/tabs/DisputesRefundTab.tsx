import React from 'react';
import { Search } from 'lucide-react';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import { AdminDisputeRecord, DisputeStatus } from '../../../data/adminData';

interface DisputesRefundTabProps {
  displayDisputes: AdminDisputeRecord[];
  disputeStatusFilter: 'all' | DisputeStatus;
  onStatusFilterChange: (status: 'all' | DisputeStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDispute: (dispute: AdminDisputeRecord) => void;
  onRejectDispute: (dispute: AdminDisputeRecord) => void;
}

export const DisputesRefundTab: React.FC<DisputesRefundTabProps> = ({
  displayDisputes,
  disputeStatusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onSelectDispute,
  onRejectDispute,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Pusat Komplain & Garansi Refund Escrow (Kebutuhan User)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Laporan pembeli atas makanan basi, porsi tidak sesuai, atau toko tutup saat penjemputan. Lindungi pembeli dengan refund 100%.
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
              placeholder="Cari tiket, nama, masalah..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
            />
          </div>

          <select
            value={disputeStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold cursor-pointer"
          >
            <option value="all">Semua Status Tiket</option>
            <option value="Sedang Ditinjau">Sedang Ditinjau</option>
            <option value="Investigasi Mitra">Investigasi Mitra</option>
            <option value="Selesai (Refund Pembeli)">Selesai (Refund)</option>
            <option value="Ditolak (Bukti Tidak Valid)">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Disputes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayDisputes.map((dispute) => {
          const isPending =
            dispute.status === 'Sedang Ditinjau' || dispute.status === 'Investigasi Mitra';

          return (
            <div
              key={dispute.id}
              className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md">
                      #{dispute.ticketCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dispute.severity.includes('Kritis')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {dispute.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 mt-1.5">
                    {dispute.category}
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    Pesanan {dispute.orderCode} • Menu: {dispute.itemName}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                >
                  {dispute.status}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Pelapor:</span>
                  <span className="font-bold text-neutral-800">
                    {dispute.reporterName} ({dispute.reporterPhone})
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Mitra UMKM:</span>
                  <span className="font-semibold text-neutral-800">{dispute.merchantName}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Nominal Transaksi:</span>
                  <span className="font-mono font-bold text-[#1F281A]">
                    {formatRupiah(dispute.amountPaid)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200/60 text-neutral-700 text-[11px] leading-relaxed">
                  <strong className="text-neutral-900">Uraian Komplain:</strong> "{dispute.description}"
                </div>
              </div>

              {isPending ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectDispute(dispute)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#f89254] hover:bg-[#e57d3d] text-white transition-colors shadow-xs cursor-pointer"
                  >
                    Eksekusi Solusi & Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectDispute(dispute)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                  >
                    Tolak
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium">
                  ✓ Catatan Resolusi: {dispute.adminResolutionNote || 'Selesai.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

