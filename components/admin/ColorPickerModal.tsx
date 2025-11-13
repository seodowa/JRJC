'use client';

import React from 'react';
import CloseIcon from '@/components/icons/CloseIcon';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

const PREDEFINED_COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF',
  '#000000', '#FFFFFF', '#808080', '#C0C0C0', '#A52A2A', '#FFA500', '#F5DEB3',
];

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onClose, onSelectColor }) => {
  if (!isOpen) {
    return null;
  }

  const handleColorClick = (color: string) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Select a Color</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <CloseIcon />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className="w-12 h-12 rounded-full border border-gray-300 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
