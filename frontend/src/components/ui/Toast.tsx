import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastData {
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
      <div
        className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
          isSuccess
            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20'
            : 'bg-red-50 text-red-800 ring-1 ring-red-600/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
        )}
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={onClose} className="ml-2 flex-shrink-0 rounded p-0.5 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
