import apiClient from './client';

export interface FlatmateProfile {
  id: number;
  userId: number;
  budget: number;
  lifestyle: string[];
  lookingFor: string[];
  occupation?: string;
  bio?: string;
  moveInDate?: string;
  city?: string;
  state?: string;
  preferredLocation?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name?: string;
    avatar?: string;
    gender?: string;
    occupation?: string;
  };
}

export interface UpdateFlatmateProfileInput {
  budget?: number;
  lifestyle?: string[];
  lookingFor?: string[];
  occupation?: string;
  bio?: string;
  moveInDate?: string;
  city?: string;
  state?: string;
  preferredLocation?: string;
}

export interface FlatmateMatch {
  profile: FlatmateProfile;
  matches: FlatmateProfile[];
}

export const getFlatmateProfile = async (): Promise<FlatmateProfile> => {
  try {
    const response = await apiClient.get('/flatmates/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching flatmate profile:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    // If profile doesn't exist (404), create one
    if (error.response?.status === 404) {
      console.log('Profile not found, creating new profile...');
      return await createFlatmateProfile();
    }

    // If it's a network error or server error, throw with more context
    if (!error.response) {
      throw new Error('Network error: Please check your internet connection and ensure the backend server is running.');
    }

    if (error.response.status >= 500) {
      throw new Error('Server error: The backend server is experiencing issues. Please try again later.');
    }

    if (error.response.status === 401) {
      throw new Error('Authentication error: Please log in again.');
    }

    throw new Error(error.response?.data?.message || 'Failed to load profile. Please try again.');
  }
};

export const createFlatmateProfile = async (): Promise<FlatmateProfile> => {
  try {
    const response = await apiClient.post('/flatmates/me', {
      budget: 0,
      lifestyle: [],
      lookingFor: [],
    });
    return response.data;
  } catch (error) {
    console.error('Error creating flatmate profile:', error);
    throw error;
  }
};

export const updateFlatmateProfile = async (profile: UpdateFlatmateProfileInput): Promise<FlatmateProfile> => {
  try {
    const response = await apiClient.put('/flatmates/me', profile);
    return response.data;
  } catch (error) {
    console.error('Error updating flatmate profile:', error);
    throw error;
  }
};

export const updateProfileAndGetMatches = async (profile: UpdateFlatmateProfileInput): Promise<FlatmateMatch> => {
  try {
    const response = await apiClient.put('/flatmates/me/matches', profile);
    return response.data;
  } catch (error) {
    console.error('Error updating profile and getting matches:', error);
    throw error;
  }
};

export const getFlatmateMatches = async (): Promise<FlatmateProfile[]> => {
  try {
    const response = await apiClient.get('/flatmates/matches');
    return response.data;
  } catch (error) {
    console.error('Error fetching flatmate matches:', error);
    throw error;
  }
};

export const searchFlatmates = async (params?: {
  minBudget?: number;
  maxBudget?: number;
  lifestyle?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}): Promise<{ profiles: FlatmateProfile[]; pagination: { page: number; limit: number; total: number } }> => {
  try {
    const response = await apiClient.get('/flatmates', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching flatmates:', error);
    throw error;
  }
};