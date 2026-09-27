'use client';

import { buttonClass } from "@/components/ui/button";
import React, { useState, useEffect } from 'react';
import CloseIcon from '@/components/icons/CloseIcon';
import { SketchPicker, ColorResult } from 'react-color';
import AsyncButton from '../AsyncButton';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  initialColor?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ isOpen, onClose, onSelectColor, initialColor }) => {
  const [color, setColor] = useState(initialColor || '#000000');

  useEffect(() => {
    if (isOpen) {
      setColor(initialColor || '#000000');
    }
  }, [isOpen, initialColor]);

  if (!isOpen) {
    return null;
  }

  const handleColorChange = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
  };

  const handleConfirm = () => {
    onSelectColor(color);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
      <div className="relative rounded-md bg-surface p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Select a color</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <CloseIcon />
          </button>
        </div>
        
        <SketchPicker
          color={color}
          onChangeComplete={handleColorChange}
        />

        <div className="flex justify-end gap-4 mt-4">
            <AsyncButton type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-ink bg-transparent hover:bg-gray-200">
              Cancel
            </AsyncButton>
            <AsyncButton type="button" onClick={handleConfirm} className={buttonClass("primary", "sm")}>
              Select
            </AsyncButton>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
