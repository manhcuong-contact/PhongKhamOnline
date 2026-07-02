'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-sky-500" />,
  };

  return (
    <div className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-lg ring-1 ring-black/5 animate-in slide-in-from-right-full">
      <div className="p-4 flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 w-0">
          <p className="text-sm font-medium text-text">{title}</p>
          {message && <p className="mt-1 text-sm text-text-light">{message}</p>}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className="inline-flex rounded-md bg-surface text-text-light hover:text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
