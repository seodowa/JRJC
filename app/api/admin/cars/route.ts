import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt, getSession } from '@/lib';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Helper functions to get specific IDs, corrected according to the provided schema
const getManufacturerId = async (name: string): Promise<number | null> => {
  const { data, error } = await supabaseAdmin.from('Manufacturer').select('Manufacturer_ID').eq('Manufacturer_Name', name).single();
  if (error) console.error(`Error fetching Manufacturer ID for ${name}:`, error);
  return data?.Manufacturer_ID || null;
};

const getTransmissionId = async (name: string): Promise<number | null> => {
  const { data, error } = await supabaseAdmin.from('Transmission_Types').select('Transmission_ID').eq('Name', name).single();
  if (error) console.error(`Error fetching Transmission ID for ${name}:`, error);
  return data?.Transmission_ID || null;
};

const getFuelId = async (name: string): Promise<number | null> => {
  const { data, error } = await supabaseAdmin.from('Fuel_Types').select('Fuel_Type_ID').eq('Fuel', name).single();
  if (error) console.error(`Error fetching Fuel ID for ${name}:`, error);
  return data?.Fuel_Type_ID || null;
};

const getLocationId = async (locationName: string): Promise<number | null> => {
    const { data, error } = await supabaseAdmin.from('Location').select('id').eq('location_name', locationName).single();
    if (error) console.error(`Error fetching Location ID for ${locationName}:`, error);
    return data?.id || null;
}

const getLocationIds = async (locationNames: string[]): Promise<Map<string, number>> => {
    const { data, error } = await supabaseAdmin
        .from('Location')
        .select('id, location_name')
        .in('location_name', locationNames);

    if (error) {
        console.error(`Error fetching Location IDs for ${locationNames.join(', ')}:`, error);
        return new Map();
    }

    const locationMap = new Map<string, number>();
    data.forEach(location => {
        locationMap.set(location.location_name, location.id);
    });

    return locationMap;
};

export async function PUT(req: Request) {
  // 1. Authenticate using the centralized getSession function
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Parse Body
    const { carId, carData } = await req.json();
    if (!carData) {
      return NextResponse.json({ error: 'Missing carData' }, { status: 400 });
    }

    const { price, brand, transmission, fuelType, model, year, seats, color, image } = carData;

    // 3. Look up Foreign Key IDs
    const [manufacturerId, transmissionId, fuelId] = await Promise.all([
        getManufacturerId(brand),
        getTransmissionId(transmission),
        getFuelId(fuelType)
    ]);

    if (!manufacturerId || !transmissionId || !fuelId) {
        let missing = [];
        if (!manufacturerId) missing.push(`brand '${brand}'`);
        if (!transmissionId) missing.push(`transmission '${transmission}'`);
        if (!fuelId) missing.push(`fuel type '${fuelType}'`);
        return NextResponse.json({ error: `Could not find required IDs for: ${missing.join(', ')}.` }, { status: 400 });
    }
    
    // --- Start of Image Deletion Logic ---
    if (carId) { // Only for updates
        // Fetch the existing car to get the old image URL
        const { data: existingCar, error: fetchError } = await supabaseAdmin
            .from('Car_Models')
            .select('image')
            .eq('Model_ID', carId)
            .single();

        if (fetchError) {
            console.error(`Could not fetch existing car for image comparison: ${fetchError.message}`);
        }

        const oldImageUrl = existingCar?.image;
        const newImageUrl = image; // from carData

        if (oldImageUrl && oldImageUrl !== newImageUrl) {
            try {
                const filePath = new URL(oldImageUrl).pathname.split('/images/')[1];
                
                if (filePath) {
                    const { error: deleteError } = await supabaseAdmin
                        .storage
                        .from('images')
                        .remove([filePath]);

                    if (deleteError) {
                        console.error(`Failed to delete old image from storage: ${deleteError.message}`);
                    }
                }
            } catch (e) {
                console.error('Error processing old image deletion:', e);
            }
        }
    }
    // --- End of Image Deletion Logic ---

    // 4. Construct Payload for Car_Models table
    const carModelPayload = {
        Manufacturer_ID: manufacturerId,
        Transmission_ID: transmissionId,
        Fuel_Type_ID: fuelId,
        Model_Name: model,
        Year_Model: year,
        Number_Of_Seats: seats,
        color_code: color,
        image: image,
    };

    // 5. Insert or Update Car_Models to get the ID
    let carModelId;
    if (carId) { // Update existing car
      const { error } = await supabaseAdmin
        .from('Car_Models')
        .update(carModelPayload)
        .eq('Model_ID', carId);
      if (error) throw new Error(`Failed to update car model: ${error.message}`);
      carModelId = carId; // Use the existing ID
    } else { // Create new car
      const { data, error } = await supabaseAdmin
        .from('Car_Models')
        .insert(carModelPayload)
        .select('Model_ID')
        .single();
      if (error || !data) throw new Error(`Failed to create car model: ${error?.message}`);
      carModelId = data.Model_ID; // Use the new ID
    }

    // 6. Handle Pricing Data now that we have a definite carModelId
    if (price && price.length > 0) {
        const locationNames = price.map((p: any) => p.Location).filter(Boolean);
        const locationIdMap = await getLocationIds(locationNames);

        const pricingPayload = price.map((p: any) => {
            const locationId = locationIdMap.get(p.Location);
            if (!locationId) {
                console.warn(`Skipping price for invalid location: ${p.Location}`);
                return null;
            }
            return {
                Car_ID: carModelId, // Now guaranteed to be valid
                Location_ID: locationId,
                Price_12_Hours: p.Price_12_Hours || null,
                Price_24_Hours: p.Price_24_Hours || null,
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);

        // WORKAROUND: Replace upsert with delete-then-insert due to missing DB constraint
        if (pricingPayload.length > 0) {
            // First, delete all existing pricing for this car
            const { error: deleteError } = await supabaseAdmin
                .from('Car_Pricing')
                .delete()
                .eq('Car_ID', carModelId);

            if (deleteError) {
                throw new Error(`Failed to remove old pricing: ${deleteError.message}`);
            }

            // Then, insert the new pricing
            const { error: insertError } = await supabaseAdmin
                .from('Car_Pricing')
                .insert(pricingPayload);

            if (insertError) {
                throw new Error(`Failed to insert new pricing: ${insertError.message}`);
            }
        }
    }

    return NextResponse.json({ message: `Car ${carId ? 'updated' : 'created'} successfully`, id: carModelId });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
    return PUT(req);
}

export async function DELETE(req: Request) {
    // 1. Authenticate using the centralized getSession function
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Get carId from URL
        const { searchParams } = new URL(req.url);
        const carId = searchParams.get('id');

        if (!carId) {
            return NextResponse.json({ error: 'Missing car ID' }, { status: 400 });
        }

        // We still fetch the car to get the image URL for deletion later
        const { data: carToSoftDelete, error: fetchError } = await supabaseAdmin
            .from('Car_Models')
            .select('image')
            .eq('Model_ID', carId)
            .single();

        if (fetchError || !carToSoftDelete) {
            // If the car doesn't exist, we can't proceed.
            return NextResponse.json({ error: 'Car not found.' }, { status: 404 });
        }

        // 3. Soft delete the car model by updating the 'is_deleted' flag
        const { error: carError } = await supabaseAdmin
            .from('Car_Models')
            .update({ is_deleted: true })
            .eq('Model_ID', carId);

        if (carError) {
            // This could still fail due to RLS or other issues, but not the FK violation.
            throw new Error(`Failed to soft-delete car: ${carError.message}`);
        }

        // 4. Delete the associated image from storage to save space
        if (carToSoftDelete.image) {
            try {
                const filePath = new URL(carToSoftDelete.image).pathname.split('/images/')[1];
                if (filePath) {
                    const { error: deleteImageError } = await supabaseAdmin
                        .storage
                        .from('images')
                        .remove([filePath]);
                    if (deleteImageError) {
                        // Log this error but don't fail the whole operation,
                        // as the main goal (soft delete) was successful.
                        console.error(`Failed to delete image for soft-deleted car ${carId}: ${deleteImageError.message}`);
                    }
                }
            } catch (e) {
                console.error(`Error processing image deletion for soft-deleted car ${carId}:`, e);
            }
        }

        return NextResponse.json({ message: 'Car deleted successfully' });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
