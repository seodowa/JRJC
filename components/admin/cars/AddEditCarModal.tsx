'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from '@/types';
import { createCar, updateCar } from '@/lib/supabase/mutations/cars';
import AsyncButton from '@/components/AsyncButton';
import CloseIcon from '@/components/icons/CloseIcon';
import CarPlaceholderIcon from '@/components/icons/CarPlaceholderIcon';
import ColorPickerModal from '@/components/admin/ColorPickerModal';
import Image from 'next/image';

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
  color: '#000000',
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
  const [formData, setFormData] = useState<Partial<Car>>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!carToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && carToEdit) {
        setFormData(carToEdit);
        setImagePreview(carToEdit.image || null);
      } else {
        setFormData(initialFormData);
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [isOpen, isEditMode, carToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          { ...existingLocationPrice, [type]: numericValue }
        ].sort((a, b) => a.Location.localeCompare(b.Location)) // Keep order consistent
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
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to save car:', error);
      // Optionally, show a toast notification for the error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <form onSubmit={handleSubmit} className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Car' : 'Add a New Car'}</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
              <CloseIcon />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Image */}
            <div className="flex flex-col items-center">
              <label className="font-semibold text-gray-700 mb-2">Car Image</label>
              <div 
                onClick={handleImageClick}
                className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Car preview" width={250} height={192} className="object-cover w-full h-full rounded-lg" />
                ) : (
                  <CarPlaceholderIcon className="w-24 h-24 text-gray-400" />
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            </div>

            {/* Column 2: Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                <select name="brand" id="brand" value={formData.brand || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="" disabled>Select a brand</option>
                  {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                <input type="text" name="model" id="model" value={formData.model || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Transmission</label>
                <select name="transmission" id="transmission" value={formData.transmission || 'Automatic'} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  {transmissionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Fuel Type</label>
                <select name="fuelType" id="fuelType" value={formData.fuelType || 'Gasoline'} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  {fuelTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">Color:</label>
                <button 
                  type="button" 
                  onClick={() => setIsColorPickerOpen(true)} 
                  className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center overflow-hidden" 
                  style={{ backgroundColor: formData.color && formData.color !== '#000000' ? formData.color : '#e0e0e0' }} // Default gray if no color or black
                >
                  {(!formData.color || formData.color === '#000000') && (
                    <span className="text-xs text-gray-600">N/A</span> // Placeholder text
                  )}
                </button>
              </div>
            </div>

            {/* Column 3: Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Pricing</h3>
              {locations.map(location => (
                <div key={location}>
                  <label className="block text-sm font-medium text-gray-700">{location}</label>
                  <div className="flex gap-2 mt-1">
                    {location !== "Outside Region 10" && (
                      <input 
                        type="number" 
                        placeholder="12 Hours Price"
                        value={formData.price?.find(p => p.Location === location)?.Price_12_Hours || ''}
                        onChange={(e) => handlePriceChange(location, 'Price_12_Hours', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                    <input 
                      type="number" 
                      placeholder="24 Hours Price"
                      value={formData.price?.find(p => p.Location === location)?.Price_24_Hours || ''}
                      onChange={(e) => handlePriceChange(location, 'Price_24_Hours', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <AsyncButton type="button" onClick={onClose} className="px-6 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300">
              Cancel
            </AsyncButton>
            <AsyncButton type="submit" isLoading={isSubmitting} loadingText="Saving..." className="px-6 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {isEditMode ? 'Save Changes' : 'Add Car'}
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
