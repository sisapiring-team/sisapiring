import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginRemote, apiErrorMessage } from '../../lib/api';

interface AdminLoginGateProps {
  onLoginSuccess: (name: string, email: string) => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginRemote(email.trim(), password);
      if (result.user.role !== 'admin') {
        setError('Akun ini tidak memiliki akses admin. Gunakan akun admin platform.');
        return;
      }
      onLoginSuccess(result.user.name, result.user.email);
    } catch (err) {
      setError(apiErrorMessage(err, 'Email atau kata sandi salah.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F281A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8da249]/20 border border-[#8da249]/40 mb-4">
            <ShieldCheck className="w-8 h-8 text-[#8da249]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Panel Admin</h1>
          <p className="text-sm text-neutral-400 mt-1">SisaPiring · Pusat Monitoring Bandung</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Email Admin
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sisapiring.com"
                className="w-full h-11 pl-10 pr-4 bg-white/10 border border-white/15 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#8da249] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 bg-white/10 border border-white/15 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#8da249] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#8da249] hover:bg-[#7b8e3d] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi…
              </>
            ) : (
              'Masuk ke Panel Admin'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Akses terbatas untuk admin platform SisaPiring
        </p>
      </div>
    </div>
  );
};
