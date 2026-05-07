import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[70] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border glass shadow-2xl animate-[slideIn_0.3s_ease-out_forwards]",
            toast.type === 'success' && "border-win/30 bg-win/5",
            toast.type === 'error' && "border-loss/30 bg-loss/5",
            toast.type === 'info' && "border-accent/30 bg-accent/5"
          )}
        >
          {toast.type === 'success' && <CheckCircle className="text-win" size={18} />}
          {toast.type === 'error' && <XCircle className="text-loss" size={18} />}
          {toast.type === 'info' && <Info className="text-accent" size={18} />}
          
          <span className="text-sm font-medium text-txt">{toast.message}</span>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-txt-2 hover:text-txt transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
