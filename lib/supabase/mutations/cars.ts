// lib/supabase/mutations/cars.ts
import { Car } from '@/types';

// In lib/supabase/mutations/cars.ts

const handleApiRequest = async (
    endpoint: string,
    method: 'POST' | 'PUT',
    body: any,
    imageFile: File | null
) => {
    let imageUrl = body.carData.image || null;

    // 1. If there's a new image, upload it first
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('category', 'car');

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Image upload failed');
        }
        const { publicUrl } = await uploadResponse.json();
        imageUrl = publicUrl;
    }

    // 2. Add the final image URL to the payload
    body.carData.image = imageUrl;

    // 3. Call the new admin car API route
    const apiResponse = await fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    // --- NEW ROBUST ERROR HANDLING ---
    if (!apiResponse.ok) {
        // If we get a 404, the server hasn't found the API route.
        if (apiResponse.status === 404) {
            throw new Error(`API route not found at ${endpoint}. Please restart your dev server.`);
        }

        // Try to parse a JSON error, but provide a fallback
        try {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error || 'Failed to save car');
        } catch (parseError) {
            // The error response itself wasn't JSON
            throw new Error(`An unknown server error occurred (Status ${apiResponse.status}).`);
        }
    }
    // --- END OF NEW ROBUST ERROR HANDLING ---

    return apiResponse.json();
};

export const createCar = async (carData: Partial<Car>, imageFile: File | null) => {
    return handleApiRequest(
        '/api/admin/cars',
        'POST',
        { carData },
        imageFile
    );
};

export const updateCar = async (carId: number, carData: Partial<Car>, imageFile: File | null) => {
    return handleApiRequest(
        '/api/admin/cars',
        'PUT',
        { carId, carData },
        imageFile
    );
};

export const deleteCar = async (carId: number) => {
    const response = await fetch(`/api/admin/cars?id=${carId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete car');
    }

    return response.json();
};

export const updateCarStatus = async (carId: number, statusId: number) => {
    const response = await fetch('/api/admin/cars/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId, statusId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update car status');
    }

    return response.json();
};