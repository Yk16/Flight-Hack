import apiClient from './client';

export interface CreateServiceInput {
  type: 'MAID' | 'COOK' | 'LAUNDRY' | 'FURNITURE' | 'APPLIANCE';
  title: string;
  description?: string;
  price: number;
  pricingModel?: 'PER_MONTH' | 'PER_JOB' | 'ONE_TIME';
  images?: string[];
  city?: string;
  state?: string;
}

export const createService = async (service: CreateServiceInput) => {
  try {
    const response = await apiClient.post('/services', service);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};
