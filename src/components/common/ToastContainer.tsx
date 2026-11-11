import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#16382C] shrink-0 mt-0.5" />;
          borderClass = 'border-[#16382C]/20';
        } else if (toast.type === 'error' || toast.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-[#EE4D2D] shrink-0 mt-0.5" />;
          borderClass = 'border-[#EE4D2D]/20';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border ${borderClass} ${bgClass} flex items-start gap-3 transition-all duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#292929] leading-tight">{toast.title}</p>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
