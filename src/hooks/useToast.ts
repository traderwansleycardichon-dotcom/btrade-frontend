import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = crypto.randomUUID();
    set((state) => ({ 
      toasts: [...state.toasts, { id, message, type }] 
    }));
    setTimeout(() => {
      set((state) => ({ 
        toasts: state.toasts.filter((t) => t.id !== id) 
      }));
    }, 4500);
  },
  removeToast: (id) => {
    set((state) => ({ 
      toasts: state.toasts.filter((t) => t.id !== id) 
    }));
  },
}));
