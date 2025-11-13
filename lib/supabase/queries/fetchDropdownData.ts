// lib/supabase/queries/fetchDropdownData.ts
import { createClient } from "@/utils/supabase/client";

export const fetchManufacturers = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("Manufacturer")
      .select("Manufacturer_Name");
    if (error) throw new Error(error.message);
    return data.map(item => item.Manufacturer_Name);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return [];
  }
};

export const fetchTransmissionTypes = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("Transmission_Types")
      .select("Name");
    if (error) throw new Error(error.message);
    return data.map(item => item.Name);
  } catch (error) {
    console.error("Error fetching transmission types:", error);
    return [];
  }
};

export const fetchFuelTypes = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("Fuel_Types")
      .select("Fuel");
    if (error) throw new Error(error.message);
    return data.map(item => item.Fuel);
  } catch (error) {
    console.error("Error fetching fuel types:", error);
    return [];
  }
};
