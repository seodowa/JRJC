export interface CarClass {
  ID: number;
  Class: string;
}

export interface LateFee {
  ID: number;
  value: number;
  Car_Class_FK: number;
  Car_Class: CarClass;
}

export const fetchLateFeesService = async (): Promise<LateFee[]> => {
  try {
    const response = await fetch('/api/admin/late-fees');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch late fees');
    }
    const data: LateFee[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching late fees:", error);
    throw error;
  }
};
