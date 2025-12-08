'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from '@/types';
import { createCar, updateCar } from '@/lib/supabase/mutations/cars';
import AsyncButton from '@/components/AsyncButton';
import CarPlaceholderIcon from '@/components/icons/CarPlaceholderIcon';
import ColorPickerModal from '@/components/admin/ColorPickerModal';
import Image from 'next/image';
import { Palette } from 'lucide-react'; 

interface AddEditCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  carToEdit?: Car | null;
  brands: string[];
  transmissionTypes: string[];
  fuelTypes: string[];
  locations: string[];
}

const initialFormData = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  seats: 4,
  color: '#FFFFFF',
  price: [],
};

const AddEditCarModal: React.FC<AddEditCarModalProps> = ({ 
  isOpen, 
  onClose, 
  carToEdit,
  brands,
  transmissionTypes,
  fuelTypes,
  locations,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Car>>(initialFormData as any);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!carToEdit;

  // Handle browser history for "swipe to back" support
  useEffect(() => {
    if (isOpen) {
      // Push a new state so the "back" action closes the modal instead of leaving the page
      window.history.pushState({ modalOpen: true }, '', window.location.href);

      const handlePopState = () => {
        // If the user swipes back or clicks browser back, this fires.
        // The state is already popped, so we just close the modal.
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen]); // We depend on isOpen so this runs when modal opens

  // Wrapper for manual close actions (Cancel/Confirm buttons)
  const handleManualClose = () => {
    // We need to go back in history to remove the state we pushed.
    // triggering 'history.back()' will fire 'popstate', which calls 'onClose()'.
    // However, to be safe and avoid loops if logic changes, we can just:
    // 1. Check if we pushed state (we assume yes if open)
    // 2. Go back.
    if (isOpen) {
        window.history.back();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && carToEdit) {
        setFormData(carToEdit);
        setImagePreview(carToEdit.image || null);
      } else {
        setFormData(initialFormData as any);
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [isOpen, isEditMode, carToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'year' || name === 'seats') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (location: string, type: 'Price_12_Hours' | 'Price_24_Hours', value: string) => {
    const numericValue = value === '' ? null : Number(value);
    setFormData(prev => {
      const existingPrices = prev.price || [];
      const otherPrices = existingPrices.filter(p => p.Location !== location);
      const existingLocationPrice = existingPrices.find(p => p.Location === location) || { Location: location };
      
      return {
        ...prev,
        price: [
          ...otherPrices,
          { Car_ID: 0, Price_12_Hours: 0, Price_24_Hours: 0, ...existingLocationPrice, [type]: numericValue }
        ].sort((a, b) => a.Location.localeCompare(b.Location))
      };
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectColor = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && carToEdit) {
        await updateCar(carToEdit.id, formData, imageFile);
      } else {
        await createCar(formData, imageFile);
      }
      // Success! Now close.
      handleManualClose(); 
    } catch (error) {
      console.error('Failed to save car:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Helper for labels
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  // Helper for input styles - slightly smaller padding (py-1.5)
  const inputClassName = "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 md:p-4">
        {/* 
            Changed layout strategy:
            - h-full w-full (mobile) -> md:h-auto md:max-h-[90vh] md:max-w-4xl (desktop)
            - flex flex-col to enable internal scrolling
        */}
        <form 
            onSubmit={handleSubmit} 
            className="relative bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-hidden flex flex-col"
        >
          
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
             <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Car' : 'Add Car'}</h2>
             {/* Close button for mobile accessibility/clarity */}
             <button type="button" onClick={handleManualClose} className="md:hidden text-gray-500 p-2">
               <span className="text-2xl">&times;</span>
             </button>
          </div>
          
          {/* Scrollable Body - Takes remaining space */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Changed gap-8 to gap-6 */}
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Side: Image Uploader - Adjusted width to w-64 (approx 256px) */}
                <div className="w-full lg:w-64 flex-shrink-0">
                <div 
                    onClick={handleImageClick}
                    className="w-full aspect-square bg-[#e0e0e0] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative hover:opacity-90 transition-opacity"
                >
                    {imagePreview ? (
                    <Image src={imagePreview} alt="Car preview" fill className="object-cover" />
                    ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <CarPlaceholderIcon className="w-20 h-20 mb-2" />
                    </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
                </div>

                {/* Right Side: Form Fields */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                
                {/* Column 1: Details - Reduced space-y */}
                <div className="space-y-3">
                    <div>
                    <Label>Brand:</Label>
                    <select name="brand" value={formData.brand || ''} onChange={handleInputChange} className={inputClassName}>
                        <option value="" disabled>Select Brand</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                    </div>
                    
                    <div>
                    <Label>Model:</Label>
                    <input type="text" name="model" value={formData.model || ''} onChange={handleInputChange} className={inputClassName} />
                    </div>

                    <div>
                    <Label>Year Model:</Label>
                    <input type="number" name="year" value={formData.year || ''} onChange={handleInputChange} className={inputClassName} />
                    </div>

                    <div>
                    <Label>Number of Car Seats:</Label>
                    <input type="number" name="seats" value={formData.seats || ''} onChange={handleInputChange} className={inputClassName} />
                    </div>

                    <div>
                    <Label>Transmission:</Label>
                    <select name="transmission" value={formData.transmission || ''} onChange={handleInputChange} className={inputClassName}>
                        {transmissionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    </div>

                    <div>
                    <Label>Fuel Type:</Label>
                    <select name="fuelType" value={formData.fuelType || ''} onChange={handleInputChange} className={inputClassName}>
                        {fuelTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    </div>
                </div>

                {/* Column 2: Color & Pricing - Reduced space-y */}
                <div className="space-y-4">
                    
                    {/* Color Picker */}
                    <div>
                    <Label>Color:</Label>
                    <button 
                        type="button" 
                        onClick={() => setIsColorPickerOpen(true)} 
                        className={`${inputClassName} flex items-center gap-2 text-left bg-white`}
                    >
                        <div className="w-5 h-5 rounded-full bg-blue-300 flex items-center justify-center text-white">
                            <Palette size={12} /> 
                        </div>
                        <span className="flex-grow text-gray-600 font-medium text-xs">
                            {formData.color || '#FFFFFF'}
                        </span>
                        <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: formData.color || '#FFFFFF' }}
                        />
                    </button>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-2">
                    <h3 className="font-bold text-sm text-gray-800">Pricing</h3>
                    
                    {locations.map(location => (
                        <div key={location}>
                        <Label>{location}:</Label>
                        <div className="flex gap-2">
                            {location !== "Outside Region 10" && (
                            <input 
                                type="number" 
                                placeholder="₱/12h"
                                value={formData.price?.find(p => p.Location === location)?.Price_12_Hours || ''}
                                onChange={(e) => handlePriceChange(location, 'Price_12_Hours', e.target.value)}
                                className={`${inputClassName} placeholder-gray-400`}
                            />
                            )}
                            <input 
                            type="number" 
                            placeholder="₱/24h"
                            value={formData.price?.find(p => p.Location === location)?.Price_24_Hours || ''}
                            onChange={(e) => handlePriceChange(location, 'Price_24_Hours', e.target.value)}
                            className={`${inputClassName} placeholder-gray-400`}
                            />
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                </div>
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleManualClose} 
              className="px-6 py-2 rounded-md text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <AsyncButton 
              type="submit" 
              isLoading={isSubmitting} 
              loadingText="Saving..." 
              className="px-6 py-2 rounded-md text-sm font-medium text-white bg-gray-900 hover:bg-black transition-colors"
            >
              Confirm
            </AsyncButton>
          </div>
        </form>
      </div>
      
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onSelectColor={handleSelectColor}
        initialColor={formData.color}
      />
    </>
  );
};

export default AddEditCarModal;