"use client"

import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Main container - fixed position, covers the whole screen
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose} // Close modal on background click
    >
      {/* Modal content - stop propagation to prevent closing when clicking inside */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-99"
        >
          <X size={24} />
        </button>
        
        {/* Content passed into the modal */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}