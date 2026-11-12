import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PackageCheck,
  XCircle,
  AlertCircle,
  Phone,
  QrCode,
  Calendar,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/seller';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const OrderManagementView: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder, setActiveTab, ordersFilterStatus, setOrdersFilterStatus } = useApp();

  const statusFilter = ordersFilterStatus;
  const setStatusFilter = setOrdersFilterStatus;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cancellation modal state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Stok bahan baku sisa piring tidak mencukupi untuk batch pesanan');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.pickupCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'waiting_confirmation':
        return {
          label: 'Menunggu Konfirmasi',
          icon: Clock,
          className: 'bg-amber-100 text-amber-900 border-amber-200',
        };
      case 'confirmed':
        return {
          label: 'Dikonfirmasi',
          icon: CheckCircle2,
          className: 'bg-blue-100 text-blue-900 border-blue-200',
        };
      case 'ready_for_pickup':
        return {
          label: 'Siap Diambil',
          icon: PackageCheck,
          className: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        };
      case 'completed':
        return {
          label: 'Selesai',
          icon: CheckCircle2,
          className: 'bg-neutral-100 text-neutral-800 border-neutral-200',
        };
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          icon: XCircle,
          className: 'bg-rose-100 text-rose-900 border-rose-200',
        };
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed', 'Ketersediaan dikonfirmasi staf UMKM');
  };

  const handleReadyForPickup = (orderId: string) => {
    updateOrderStatus(orderId, 'ready_for_pickup', 'Makanan sisa piring telah dikemas rapi di meja pickup');
  };

  const handleOpenCancelModal = (order: Order) => {
    setOrderToCancel(order);
  };

  const handleExecuteCancel = () => {
    if (orderToCancel) {
      cancelOrder(orderToCancel.id, cancelReason);
      setOrderToCancel(null);
      if (selectedOrder?.id === orderToCancel.id) {
        setSelectedOrder(null);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1F281A] tracking-tight">
            Pesanan Masuk (Incoming Orders)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Pantau pesanan penjemputan sisa piring dan pastikan paket makanan siap sebelum diambil warga.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('qr_pickup')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F281A] hover:bg-[#2D3A26] text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
        >
          <QrCode className="w-4 h-4 text-[#fbe1b5]" />
          <span>Buka Verifikasi QR Kasir</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: `Semua (${orders.length})` },
              {
                id: 'waiting_confirmation',
                label: `Menunggu (${orders.filter((o) => o.status === 'waiting_confirmation').length})`,
              },
              {
                id: 'confirmed',
                label: `Dikonfirmasi (${orders.filter((o) => o.status === 'confirmed').length})`,
              },
              {
                id: 'ready_for_pickup',
                label: `Siap Diambil (${orders.filter((o) => o.status === 'ready_for_pickup').length})`,
              },
              {
                id: 'completed',
                label: `Selesai (${orders.filter((o) => o.status === 'completed').length})`,
              },
              {
                id: 'cancelled',
                label: `Batal (${orders.filter((o) => o.status === 'cancelled').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#1F281A] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pesanan, nama, atau kode..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs space-y-2">
          <p className="text-sm font-semibold text-neutral-700">Tidak ada pesanan pada filter ini</p>
          <p className="text-xs text-neutral-500">
            {searchQuery
              ? `Tidak ditemukan pesanan yang sesuai dengan "${searchQuery}".`
              : 'Belum ada pesanan dengan status tersebut.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 md:p-5 border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all space-y-3"
              >
                {/* Top Row: Order ID, Timestamp, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#1F281A]">{order.id}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-500">{order.orderDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${badge.className}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Middle: Customer & Ordered Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <span className="text-neutral-400 uppercase font-semibold text-[10px]">
                      Data Pengambil
                    </span>
                    <p className="font-bold text-neutral-800 text-sm">{order.customerName}</p>
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 mt-1">
                      <Clock className="w-3 h-3 text-[#f89254]" />
                      <span>Batas Ambil: <strong className="text-neutral-800">{order.pickupDeadline}</strong></span>
                    </div>
                  </div>

                  {/* Ordered Items Preview */}
                  <div className="md:col-span-1 space-y-1">
                    <span className="text-neutral-400 uppercase font-semibold text-[10px]">
                      Menu Sisa Piring ({totalItemsCount} Porsi)
                    </span>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-neutral-700">
                          <span className="truncate max-w-[200px]" title={item.productName}>
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-mono text-neutral-500 shrink-0 ml-2">
                            {item.pricePerItem === 0 ? 'Bebas Bayar' : formatRupiah(item.pricePerItem * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Code & Payment */}
                  <div className="md:text-right space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-neutral-400 uppercase font-semibold text-[10px] block">
                        Kode Pickup PIN
                      </span>
                      <span className="font-mono font-bold text-base text-[#f89254] tracking-wider">
                        {order.pickupCode}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 text-[11px] block">Total Pembayaran</span>
                      <span className="font-mono font-bold text-base text-[#1F281A]">
                        {order.totalPayment === 0 ? 'Rp 0 (Donasi)' : formatRupiah(order.totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Rincian Lengkap</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Action depending on state */}
                    {order.status === 'waiting_confirmation' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Tolak Pesanan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F281A] hover:bg-[#2D3A26] rounded-lg transition-colors shadow-xs"
                        >
                          Konfirmasi Ketersediaan
                        </button>
                      </>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleReadyForPickup(order.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#f89254] hover:bg-[#e57d3d] rounded-lg transition-colors shadow-xs"
                      >
                        Tandai Siap Diambil
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('qr_pickup')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#fbe1b5]" />
                        <span>Verifikasi QR Pengambilan</span>
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                        ✓ Diserahkan ({order.verifiedAt || 'Selesai'})
                      </span>
                    )}

                    {order.status === 'cancelled' && (
                      <span className="text-[11px] text-rose-800 font-semibold bg-rose-50 px-2 py-1 rounded">
                        ✕ Dibatalkan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <span className="font-mono font-bold text-base text-[#1F281A]">{selectedOrder.id}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-mono font-semibold text-[#f89254]">
                PIN: {selectedOrder.pickupCode}
              </span>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-neutral-400 uppercase font-semibold text-[10px] block">
                  Informasi Pelanggan
                </span>
                <p className="font-bold text-neutral-800 text-sm mt-0.5">{selectedOrder.customerName}</p>
                <p className="text-neutral-600">{selectedOrder.customerPhone}</p>
                <p className="text-neutral-500 mt-0.5">Batas Ambil: {selectedOrder.pickupDeadline}</p>
              </div>

              <div>
                <span className="text-neutral-400 uppercase font-semibold text-[10px] block mb-2">
                  Rincian Produk Makanan
                </span>
                <div className="space-y-2 border border-neutral-100 rounded-xl p-3 bg-neutral-50">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-800 truncate">{it.productName}</p>
                        <p className="text-neutral-500 text-[11px]">
                          {it.quantity} porsi x {formatRupiah(it.pricePerItem)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-neutral-800 shrink-0">
                        {formatRupiah(it.pricePerItem * it.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                    <span>Total Transaksi</span>
                    <span className="font-mono text-[#1F281A]">
                      {selectedOrder.totalPayment === 0 ? 'Rp 0 (Donasi)' : formatRupiah(selectedOrder.totalPayment)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 uppercase font-semibold text-[10px] block mb-1">
                  Riwayat Status Pesanan
                </span>
                <div className="space-y-2 border-l-2 border-neutral-200 pl-3">
                  {selectedOrder.statusHistory.map((sh, idx) => (
                    <div key={idx} className="text-[11px]">
                      <span className="font-semibold text-neutral-800 uppercase">
                        {sh.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-neutral-400 ml-2">{sh.timestamp}</span>
                      {sh.note && <p className="text-neutral-600">{sh.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-200"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Tolak / Batalkan Pesanan {orderToCancel.id}?
            </h3>
            <p className="text-xs text-neutral-600">
              Mohon berikan alasan pembatalan agar tim SisaPiring dapat menginformasikan kepada pembeli secara transparan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Alasan Pembatalan:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
              >
                <option value="Stok bahan baku sisa piring tidak mencukupi untuk batch pesanan">
                  Stok bahan baku sisa piring tidak mencukupi untuk batch pesanan
                </option>
                <option value="Kondisi makanan tidak memenuhi standar uji food safety sore ini">
                  Kondisi makanan tidak memenuhi standar uji food safety sore ini
                </option>
                <option value="Toko harus tutup lebih awal karena kendala operasional mendadak">
                  Toko harus tutup lebih awal karena kendala operasional mendadak
                </option>
                <option value="Pelanggan meminta perubahan jadwal di luar jam operasional">
                  Pelanggan meminta perubahan jadwal di luar jam operasional
                </option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleExecuteCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
              >
                Konfirmasi Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
