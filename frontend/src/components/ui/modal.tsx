'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/20 backdrop-blur-sm transition-all duration-200 p-4">
      <div 
        className={cn(
          'relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200', 
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-text-light hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        
        {title && (
          <h2 className="font-outfit text-xl font-semibold tracking-tight text-text mb-1">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-text-light mb-4">{description}</p>
        )}
        
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
