import React, { useId, useState, useCallback } from 'react';
import {
  Star, Search, Sparkles, AlertTriangle, Eye, EyeOff,
  MessageSquareReply, BookmarkCheck, Store, CheckCircle2,
  MapPin, ShieldCheck, SlidersHorizontal, Leaf, Send, X,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, ChevronDown,
} from 'lucide-react';
import { useAdminReviews, type AdminReview, type ReviewStatusFilter } from '../../../hooks/useAdminReviews';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function starColor(r: number) { return r >= 4 ? '#8da249' : r === 3 ? '#f0a500' : '#e05c3a'; }

const QUICK_REPLY_TEMPLATES = [
  'Terima kasih telah menyelamatkan hidangan bersama SisaPiring! Ulasan Anda membantu ekosistem pangan Bandung.',
  'Kami telah meneruskan masukan kemasan & suhu ini kepada mitra UMKM agar SOP higienitas semakin terjaga.',
  'Tim Quality Control SisaPiring sedang melakukan audit prep window dan segel higienis di gerai terkait.',
];

/* ─── Reply Modal ─────────────────────────────────────────────────────── */
interface ReplyModalProps {
  review: AdminReview;
  onClose: () => void;
  onSave: (id: number, reply: string) => Promise<void>;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ review, onClose, onSave }) => {
  const [reply, setReply] = useState(review.adminReply ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try { await onSave(review.id, reply.trim()); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%', padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.18)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <MessageSquareReply size={16} style={{ color: '#6a8338' }} />
          <span style={{ fontSize: 15, fontWeight: 700 }}>Balas Ulasan</span>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 0, cursor: 'pointer', color: '#888' }}><X size={16} /></button>
        </div>

        {/* Original review */}
        <div style={{ background: '#f6f8f2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12} style={{ fill: s <= review.rating ? '#f0a500' : 'none', color: s <= review.rating ? '#f0a500' : '#ccc' }} />
            ))}
            <span style={{ fontWeight: 600, color: '#283529' }}>{review.reviewer?.name}</span>
            <span style={{ color: '#5b6855', fontSize: 11 }}>· {review.merchant?.businessName}</span>
          </div>
          <p style={{ color: '#44513f', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
        </div>

        {/* Templates */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#5b6855', display: 'block', marginBottom: 6 }}>Template cepat:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {QUICK_REPLY_TEMPLATES.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReply(t)}
                style={{ textAlign: 'left', background: '#f0f5e8', border: '1px solid #dce6cb', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#3d5a1a', cursor: 'pointer' }}
              >
                {t.length > 80 ? t.slice(0, 80) + '…' : t}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Tulis balasan resmi Admin SisaPiring…"
          style={{ width: '100%', minHeight: 80, border: '1px solid #d9e1cf', borderRadius: 9, padding: 10, fontSize: 13, resize: 'vertical', background: '#f6f8f2', fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #e5eadf', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#5f6c5c' }}>Batal</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !reply.trim()}
            style={{ background: '#1F281A', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: !reply.trim() ? .5 : 1 }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Simpan Balasan
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Review Card ─────────────────────────────────────────────────────── */
interface ReviewCardProps {
  review: AdminReview;
  onModerate: (id: number, status: 'published' | 'flagged' | 'hidden') => Promise<void>;
  onOpenReply: (r: AdminReview) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onModerate, onOpenReply }) => {
  const [loading, setLoading] = useState(false);

  const toggle = async (next: 'published' | 'hidden') => {
    setLoading(true);
    try { await onModerate(review.id, next); } finally { setLoading(false); }
  };

  const feature = async () => {
    setLoading(true);
    try { await onModerate(review.id, 'published'); } finally { setLoading(false); }
  };

  const isFlagged = review.moderationStatus === 'flagged';
  const isHidden  = review.moderationStatus === 'hidden';

  return (
    <article style={{
      background: '#fff',
      border: `1px solid ${isFlagged ? '#f5c842' : isHidden ? '#e0e0dc' : '#e5eadf'}`,
      borderRadius: 12,
      overflow: 'hidden',
      opacity: isHidden ? .75 : 1,
    }}>
      {/* Status ribbon */}
      {(isFlagged || isHidden) && (
        <div style={{
          padding: '6px 14px',
          fontSize: 11,
          fontWeight: 700,
          background: isFlagged ? '#fff9e0' : '#f5f5f2',
          color: isFlagged ? '#a07c10' : '#5a5a52',
          borderBottom: `1px solid ${isFlagged ? '#f5c842' : '#ddd'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          {isFlagged ? <AlertTriangle size={12} /> : <EyeOff size={12} />}
          {isFlagged ? 'Perlu Tindak Lanjut' : 'Disembunyikan dari Publik'}
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: isFlagged ? '#fff3c8' : '#1F281A',
              color: isFlagged ? '#a07c10' : '#fff',
              display: 'grid', placeItems: 'center',
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              {review.reviewer?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#283529' }}>{review.reviewer?.name ?? 'Anonim'}</div>
              <div style={{ fontSize: 11, color: '#5b6855', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={10} />
                {review.merchant?.businessName ?? '—'}
              </div>
            </div>
          </div>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={13} style={{ fill: s <= review.rating ? '#f0a500' : 'none', color: s <= review.rating ? '#f0a500' : '#ddd' }} />
            ))}
          </div>
        </div>

        {/* Product */}
        {review.product && (
          <div style={{ fontSize: 11, color: '#8da249', fontWeight: 600, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Leaf size={10} />
            {review.product.name}
          </div>
        )}

        {/* Comment */}
        <p style={{ fontSize: 12, color: '#44513f', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {review.comment}
        </p>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {review.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 600, background: '#f0f5e8', color: '#4b6329', borderRadius: 999, padding: '2px 8px', border: '1px solid #dce6cb' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Admin reply */}
        {review.adminReply && (
          <div style={{ marginTop: 10, background: '#f0f5e8', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#3d5a1a', borderLeft: '3px solid #8da249' }}>
            <span style={{ fontWeight: 700, display: 'block', marginBottom: 2 }}>Balasan Admin SisaPiring:</span>
            {review.adminReply}
          </div>
        )}

        {/* Flag reason */}
        {review.flagReason && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#a07c10', background: '#fff9e0', borderRadius: 7, padding: '5px 9px' }}>
            Alasan flag: {review.flagReason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f2ed', background: '#fafcf7', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => onOpenReply(review)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1F281A', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          <MessageSquareReply size={11} />
          {review.adminReply ? 'Edit Balasan' : 'Balas'}
        </button>

        {!isHidden ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => toggle('hidden')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', color: '#5f6a55', border: '1px solid #d9dfd0', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <EyeOff size={11} />}
            Sembunyikan
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => toggle('published')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f2f6eb', color: '#66803c', border: '1px solid #d9e4c9', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <Eye size={11} />}
            Tampilkan
          </button>
        )}

        {isFlagged && (
          <button
            type="button"
            disabled={loading}
            onClick={feature}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e9f2de', color: '#47651f', border: '1px solid #c8dfa8', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            <CheckCircle2 size={11} />Approve
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8b967f' }}>
          {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </article>
  );
};

/* ─── Main Tab ────────────────────────────────────────────────────────── */
export const ReviewsModerationTab: React.FC = () => {
  const searchId = useId();
  const filterId = useId();

  const [statusFilter, setStatusFilter]   = useState<ReviewStatusFilter>('all');
  const [searchQuery,  setSearchQuery]    = useState('');
  const [debouncedQ,   setDebouncedQ]     = useState('');
  const [page,         setPage]           = useState(1);
  const [replyTarget,  setReplyTarget]    = useState<AdminReview | null>(null);
  const [toast,        setToast]          = useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(searchQuery); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { reviews, loading, error, totalPages, total, reload, moderate } =
    useAdminReviews(statusFilter, debouncedQ, page);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleModerate = useCallback(async (id: number, status: 'published' | 'flagged' | 'hidden') => {
    await moderate(id, status);
    const labels = { published: 'Ulasan ditampilkan.', flagged: 'Ulasan diflag.', hidden: 'Ulasan disembunyikan.' };
    showToast(labels[status]);
  }, [moderate]);

  const handleSaveReply = useCallback(async (id: number, reply: string) => {
    await moderate(id, 'published', reply);
    showToast('Balasan admin berhasil disimpan.');
  }, [moderate]);

  // Analytics
  const analytics = React.useMemo(() => {
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const flagged  = reviews.filter((r) => r.moderationStatus === 'flagged').length;
    const hidden   = reviews.filter((r) => r.moderationStatus === 'hidden').length;
    const replied  = reviews.filter((r) => r.adminReply).length;
    const dist = [5,4,3,2,1].map((s) => {
      const count = reviews.filter((r) => r.rating === s).length;
      return { star: s, count, pct: reviews.length ? Math.round(count / reviews.length * 100) : 0 };
    });
    return { avg: avg.toFixed(1), flagged, hidden, replied, dist };
  }, [reviews]);

  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 1280, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, background: '#1F281A', color: '#fff', padding: '12px 18px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {replyTarget && (
        <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} onSave={handleSaveReply} />
      )}

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 16, background: '#edf2e4', color: '#6a8338', border: '1px solid #dce6cb', flexShrink: 0 }}>
          <Star size={24} strokeWidth={1.7} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7d59', marginBottom: 2 }}>SisaPiring · Ulasan</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.5px', margin: 0 }}>Ulasan & Kepuasan</h2>
          <p style={{ color: '#5b6855', fontSize: 15, marginTop: 2 }}>Pantau rating, moderasi ulasan, dan balas masukan pembeli.</p>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #d9e1cf', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#5b6855', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
        >
          <RefreshCw size={14} />
        </button>
      </header>

      {/* Analytics */}
      {!loading && !error && reviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Rating command card */}
          <div style={{ background: '#1F281A', borderRadius: 20, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(141,162,73,.15)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#b7cc74', marginBottom: 8 }}>Indeks Kepuasan</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 44, fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>{analytics.avg}</span>
              <span style={{ fontSize: 14, color: '#aaa' }}>/ 5.0</span>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} style={{ fill: s <= Math.round(Number(analytics.avg)) ? '#f0a500' : 'rgba(255,255,255,.2)', color: s <= Math.round(Number(analytics.avg)) ? '#f0a500' : 'rgba(255,255,255,.2)' }} />
              ))}
              <span style={{ fontSize: 11, color: '#ccc', marginLeft: 6 }}>({total} ulasan)</span>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.1)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, textAlign: 'center' }}>
              {[
                { label: 'Direspon', val: analytics.replied },
                { label: 'Diflag', val: analytics.flagged, warn: analytics.flagged > 0 },
                { label: 'Tersembunyi', val: analytics.hidden },
              ].map((item) => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '8px 4px', border: '1px solid rgba(255,255,255,.08)' }}>
                  <span style={{ fontSize: 10, color: '#aaa', display: 'block' }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'monospace', color: item.warn ? '#f5c842' : '#fff' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #e5eadf' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Distribusi Rating</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analytics.dist.map((row) => (
                <div key={row.star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#283529', width: 24, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {row.star}<Star size={9} style={{ fill: '#f0a500', color: '#f0a500' }} />
                  </span>
                  <div style={{ flex: 1, height: 8, background: '#f0f2ed', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: row.star >= 4 ? '#8da249' : row.star === 3 ? '#f0a500' : '#e05c3a', borderRadius: 999, transition: 'width .3s' }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#5b6855', width: 44, textAlign: 'right' }}>{row.count} ({row.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 18px', background: '#fff', border: '1px solid #e3e9db', borderRadius: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 650 }}>
          Daftar ulasan
          <span style={{ display: 'block', fontSize: 13, fontWeight: 400, color: '#5b6855', marginTop: 2 }}>
            {loading ? 'Memuat...' : `${total.toLocaleString('id-ID')} ulasan`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 260 }}>
            <label htmlFor={searchId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Cari ulasan</label>
            <Search size={16} style={{ position: 'absolute', left: 13, color: '#6f8062', pointerEvents: 'none' }} />
            <input
              id={searchId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau toko…"
              style={{ width: '100%', height: 42, background: '#f6f8f2', border: '1px solid #d9e1cf', borderRadius: 11, padding: '0 36px 0 40px', fontSize: 14, color: '#283529', fontFamily: 'inherit' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, background: 'none', border: 0, cursor: 'pointer', color: '#5f6e53' }}><X size={14} /></button>
            )}
          </div>
          {/* Filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <label htmlFor={filterId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Filter status</label>
            <SlidersHorizontal size={14} style={{ position: 'absolute', left: 12, color: '#6f8062', pointerEvents: 'none' }} />
            <select
              id={filterId}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as ReviewStatusFilter); setPage(1); }}
              style={{ appearance: 'none', height: 42, width: 180, border: '1px solid #d9e1cf', background: '#fff', borderRadius: 11, padding: '0 32px 0 34px', fontSize: 14, fontWeight: 500, color: '#44513f', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="all">Semua status</option>
              <option value="published">Ditampilkan</option>
              <option value="flagged">Diflag</option>
              <option value="hidden">Tersembunyi</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 12, color: '#6f8062', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, color: '#5b6855' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: 15 }}>Memuat ulasan…</span>
        </div>
      ) : error ? (
        <div style={{ border: '1px dashed #d3dcc4', borderRadius: 16, textAlign: 'center', padding: '48px 24px' }}>
          <AlertCircle size={24} style={{ color: '#6a8338', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>Gagal memuat data</h3>
          <p style={{ color: '#5b6855', fontSize: 14 }}>{error}</p>
          <button type="button" onClick={() => reload()} style={{ marginTop: 14, border: '1px solid #cfdcb9', background: '#f0f5e8', color: '#4b6529', borderRadius: 10, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Coba lagi</button>
        </div>
      ) : reviews.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} onModerate={handleModerate} onOpenReply={setReplyTarget} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ width: 36, height: 36, border: '1px solid #d9e1cf', borderRadius: 9, background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: page <= 1 ? .4 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: '#5b6855' }}>Halaman {page} dari {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ width: 36, height: 36, border: '1px solid #d9e1cf', borderRadius: 9, background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: page >= totalPages ? .4 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ border: '1px dashed #d3dcc4', borderRadius: 16, textAlign: 'center', padding: '48px 24px' }}>
          <Star size={22} style={{ color: '#6a8338', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>{hasFilters ? 'Ulasan tidak ditemukan' : 'Belum ada ulasan'}</h3>
          <p style={{ color: '#5b6855', fontSize: 14 }}>{hasFilters ? 'Coba ubah filter atau kata kunci.' : 'Ulasan dari pembeli akan muncul di sini.'}</p>
          {hasFilters && (
            <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} style={{ marginTop: 14, border: '1px solid #cfdcb9', background: '#f0f5e8', color: '#4b6529', borderRadius: 10, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Reset filter</button>
          )}
        </div>
      )}
    </div>
  );
};
