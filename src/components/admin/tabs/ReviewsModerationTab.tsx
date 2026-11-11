import React from 'react';
import { Star } from 'lucide-react';

export const ReviewsModerationTab: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      buyer: 'Siti Nurhaliza',
      store: 'Kala Bakehouse & Artisan Cafe',
      product: 'Artisan Butter Croissant & Pain au Chocolat',
      rating: 5,
      date: 'Hari ini, 18:30 WIB',
      comment:
        'Croissant masih renyah banget pas dihangatkan! Beli jam 6 sore hemat 60%, rasa butter premium tetap terasa mewah.',
      tags: ['Masih Hangat & Segar', 'Sesuai Deskripsi'],
    },
    {
      id: 'rev-2',
      buyer: 'Dimas Prasetyo',
      store: 'Dapur Bu Siti Sunda Asli',
      product: 'Nasi Liwet Komplit Ayam Bakar Madu',
      rating: 5,
      date: 'Kemarin, 20:15 WIB',
      comment:
        'Porsi katering event bersih dan tertutup rapat. Nasi liwetnya wangi, sambal lalap masih segar!',
      tags: ['Porsi Pas', 'Kemasan Rapi'],
    },
    {
      id: 'rev-3',
      buyer: 'Angga Wijaya',
      store: 'Kala Bakehouse & Artisan Cafe',
      product: 'Rustic Sourdough Loaf Gandum Utuh',
      rating: 4,
      date: '2 hari lalu',
      comment:
        'Sourdough bagus, renyah dan empuk di dalam. Cocok untuk sarapan keluarga hemat.',
      tags: ['Sesuai Deskripsi'],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Ulasan & Kepuasan Pelanggan (Sisi User & Penjual)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pantau rating bintang dan testimoni pembeli Bandung untuk menjaga reputasi mutu makanan sisa piring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Rata-rata Platform: 4.8 / 5.0
          </span>
        </div>
      </div>

      {/* Customer Reviews Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#16382C] text-white flex items-center justify-center font-bold text-xs">
                  {rev.buyer[0]}
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block text-xs">{rev.buyer}</span>
                  <span className="text-[10px] text-neutral-400 block">{rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-neutral-800 block text-[11px] truncate">
                {rev.store}
              </span>
              <span className="text-neutral-500 text-[10px] block truncate">{rev.product}</span>
              <p className="text-neutral-700 text-xs italic mt-1">"{rev.comment}"</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {rev.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-md border border-emerald-100"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

