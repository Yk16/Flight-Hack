import apiClient from './client';
import { House } from '../types/housing';

type HouseStatus = 'AVAILABLE' | 'RENTED' | 'INACTIVE' | 'UNDER_MAINTENANCE';

const parseJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseMaybeNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const normalizeHouse = (house: any): House => ({
  id: String(house.id),
  title: house.title,
  description: house.description,
  type: house.type,
  addressLine1: house.addressLine1,
  addressLine2: house.addressLine2,
  state: house.state,
  rent: Number(house.rent),
  deposit: Number(house.deposit),
  city: house.city,
  pincode: house.pincode,
  latitude: parseMaybeNumber(house.latitude),
  longitude: parseMaybeNumber(house.longitude),
  maintenanceCharges: parseMaybeNumber(house.maintenanceCharges),
  bedrooms: parseMaybeNumber(house.bedrooms),
  bathrooms: parseMaybeNumber(house.bathrooms),
  area: parseMaybeNumber(house.area),
  floor: parseMaybeNumber(house.floor),
  totalFloors: parseMaybeNumber(house.totalFloors),
  furnishing: house.furnishing,
  amenities: parseJsonArray(house.amenities),
  images: parseJsonArray(house.images),
  preferredTenants: parseJsonArray(house.preferredTenants),
  petsAllowed: Boolean(house.petsAllowed),
  status: house.status as HouseStatus | undefined,
  availableFrom: house.availableFrom,
  viewCount: parseMaybeNumber(house.viewCount),
  inquiryCount: parseMaybeNumber(house.inquiryCount),
  createdAt: house.createdAt,
  updatedAt: house.updatedAt,
  ownerId: house.ownerId ?? house.owner?.id,
  owner: house.owner
    ? {
        id: Number(house.owner.id),
        name: house.owner.name,
        avatar: house.owner.avatar,
        trustScore: parseMaybeNumber(house.owner.trustScore),
        phone: house.owner.phone,
        aadhaarVerified: Boolean(house.owner.aadhaarVerified),
      }
    : house.ownerId
      ? {
          id: Number(house.ownerId),
          name: 'Owner',
        }
      : undefined,
});

export const fetchHouses = async (): Promise<House[]> => {
  try {
    console.log('[fetchHouses] Requesting /houses from backend...');
    const response = await apiClient.get('/houses');
    console.log('[fetchHouses] Backend response shape:', {
      isArray: Array.isArray(response.data),
      hasData: !!response.data?.data,
      hasHouses: !!response.data?.houses,
      keys: Object.keys(response.data || {}),
    });
    
    const houses = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.houses)
        ? response.data.houses
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

    console.log('[fetchHouses] Normalized to array with', houses.length, 'items');

    return houses.map(normalizeHouse);
  } catch (error) {
    console.warn('[fetchHouses] Failed to fetch houses from backend:', {
      message: (error as any)?.message,
      code: (error as any)?.code,
      status: (error as any)?.response?.status,
    });
    return [];
  }
};

export const fetchHouseById = async (houseId: string): Promise<House | null> => {
  try {
    const response = await apiClient.get(`/houses/${houseId}`);
    const house = response.data?.data ?? response.data;
    return house ? normalizeHouse(house) : null;
  } catch (error) {
    console.warn('[fetchHouseById] Failed to fetch house:', {
      message: (error as any)?.message,
      status: (error as any)?.response?.status,
    });
    return null;
  }
};

export const updateHouse = async (houseId: string, payload: Partial<House>) => {
  const response = await apiClient.put(`/houses/${houseId}`, payload);
  return response.data;
};

export const deleteHouse = async (houseId: string) => {
  const response = await apiClient.delete(`/houses/${houseId}`);
  return response.data;
};
