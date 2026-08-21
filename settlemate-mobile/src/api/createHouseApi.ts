import apiClient from './client';

export interface CreateHouseInput {
  title: string;
  description?: string;
  type: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  rent: number;
  deposit: number;
  maintenanceCharges?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  furnishing?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  amenities?: string[];
  images?: string[];
  preferredTenants?: string[];
  petsAllowed?: boolean;
  availableFrom?: string;
}

export const createHouse = async (house: CreateHouseInput) => {
  try {
    console.log('[createHouseApi] Submitting house:', {
      title: house.title,
      city: house.city,
      rent: house.rent,
      deposit: house.deposit,
    });
    const response = await apiClient.post('/houses', house);
    console.log('[createHouseApi] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[createHouseApi] Error creating house:', {
      message: (error as any)?.message,
      response: (error as any)?.response?.data,
      status: (error as any)?.response?.status,
    });
    throw error;
  }
};
