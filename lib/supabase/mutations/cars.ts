// lib/supabase/mutations/cars.ts
import { Car } from '@/types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const handleImageUpload = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Image upload failed');
  }

  const { publicUrl } = await response.json();
  return publicUrl;
};

export const createCar = async (carData: Partial<Car>, imageFile: File | null) => {
  let imageUrl = carData.image || null;

  if (imageFile) {
    imageUrl = await handleImageUpload(imageFile);
  }

  // Get Manufacturer ID
  const { data: manufacturerData, error: manufacturerError } = await supabase
    .from('Manufacturer')
    .select('Manufacturer_ID')
    .eq('Manufacturer_Name', carData.brand)
    .single();

  if (manufacturerError || !manufacturerData) {
    throw new Error(`Invalid manufacturer: ${carData.brand}. ${manufacturerError?.message}`);
  }

  // Get Fuel Type ID
  const { data: fuelTypeData, error: fuelTypeError } = await supabase
    .from('Fuel_Types')
    .select('Fuel_Type_ID')
    .eq('Fuel', carData.fuelType)
    .single();

  if (fuelTypeError || !fuelTypeData) {
    throw new Error(`Invalid fuel type: ${carData.fuelType}. ${fuelTypeError?.message}`);
  }

  // Get Transmission Type ID
  const { data: transmissionData, error: transmissionError } = await supabase
    .from('Transmission_Types')
    .select('Transmission_ID')
    .eq('Name', carData.transmission)
    .single();

  if (transmissionError || !transmissionData) {
    throw new Error(`Invalid transmission type: ${carData.transmission}. ${transmissionError?.message}`);
  }

  const { data, error } = await supabase
    .from('Car_Models')
    .insert([
      {
        Model_Name: carData.model,
        Manufacturer_ID: manufacturerData.Manufacturer_ID,
        Year_Model: carData.year,
        Transmission_ID: transmissionData.Transmission_ID,
        Fuel_Type_ID: fuelTypeData.Fuel_Type_ID,
        Number_Of_Seats: carData.seats,
        color_code: carData.color,
        image: imageUrl,
      },
    ])
    .select();

  if (error) {
    throw new Error(`Failed to create car: ${error.message}`);
  }

  return data;
};

export const updateCar = async (carId: number, carData: Partial<Car>, imageFile: File | null) => {
  const updatePayload: { [key: string]: any } = {
    Model_Name: carData.model,
    Year_Model: carData.year,
    Number_Of_Seats: carData.seats,
    color_code: carData.color,
  };

  if (imageFile) {
    const imageUrl = await handleImageUpload(imageFile);
    updatePayload.image = imageUrl;
  }

  // Get Manufacturer ID if brand is provided
  if (carData.brand) {
    const { data: manufacturerData, error: manufacturerError } = await supabase
      .from('Manufacturer')
      .select('Manufacturer_ID')
      .eq('Manufacturer_Name', carData.brand)
      .single();
    if (manufacturerError || !manufacturerData) throw new Error(`Invalid manufacturer: ${carData.brand}. ${manufacturerError?.message}`);
    updatePayload.Manufacturer_ID = manufacturerData.Manufacturer_ID;
  }

  // Get Fuel Type ID if fuelType is provided
  if (carData.fuelType) {
    const { data: fuelTypeData, error: fuelTypeError } = await supabase
      .from('Fuel_Types')
      .select('Fuel_Type_ID')
      .eq('Fuel', carData.fuelType)
      .single();
    if (fuelTypeError || !fuelTypeData) throw new Error(`Invalid fuel type: ${carData.fuelType}. ${fuelTypeError?.message}`);
    updatePayload.Fuel_Type_ID = fuelTypeData.Fuel_Type_ID;
  }

  // Get Transmission Type ID if transmission is provided
  if (carData.transmission) {
    const { data: transmissionData, error: transmissionError } = await supabase
      .from('Transmission_Types')
      .select('Transmission_ID')
      .eq('Name', carData.transmission)
      .single();
    if (transmissionError || !transmissionData) throw new Error(`Invalid transmission type: ${carData.transmission}. ${transmissionError?.message}`);
    updatePayload.Transmission_ID = transmissionData.Transmission_ID;
  }

  const { data, error } = await supabase
    .from('Car_Models')
    .update(updatePayload)
    .eq('Model_ID', carId)
    .select();

  if (error) {
    throw new Error(`Failed to update car: ${error.message}`);
  }

  return data;
};