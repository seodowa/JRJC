"use client"

import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, children, hideCloseButton = false }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Main container - fixed position, covers the whole screen
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      onClick={onClose} // Close modal on background click
    >
      {/* Modal content - stop propagation to prevent closing when clicking inside */}
      <div 
        className="relative w-full max-w-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!hideCloseButton && (
          <button 
            onClick={onClose}
            aria-label="Close"
            className="absolute top-8 right-8 z-99 rounded-md p-1 text-ink-2 transition-colors hover:bg-gray-200 hover:text-ink"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        )}
        
        {/* Content passed into the modal */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}