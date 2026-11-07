'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function GameModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
}: GameModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="rw-panel w-full relative p-6 md:p-8"
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d8ae68]/30">
          <h2 className="font-display text-xl text-[#f2e8d5] tracking-wider uppercase">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#b6ae9b] hover:text-[#d8ae68] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

