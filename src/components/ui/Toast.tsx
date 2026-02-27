import { useEffect, useState } from 'react';
import type { Toast as ToastType } from '../../types';

interface Props {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.slice(-3).map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration ?? 2000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`px-4 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium shadow transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      ✨ {toast.message}
    </div>
  );
}
