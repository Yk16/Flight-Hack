import apiClient from './client';
import { Service, ServiceBooking } from '../types/services';

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const response = await apiClient.get('/services');
    // Handle different possible response formats from the backend
    // common shapes: response.data (array), response.data.data (array), response.data.services (array)
    let services: Service[] = [];

    if (Array.isArray(response.data)) {
      services = response.data;
    } else if (Array.isArray(response.data?.data)) {
      services = response.data.data;
    } else if (Array.isArray(response.data?.services)) {
      services = response.data.services;
    }

    console.log('Fetched services from backend:', services.length);
    
    // If backend returns real services, use them; otherwise fall back to mock
    if (services.length > 0) {
      return services;
    }
    
    console.warn('No services from backend. Using mock data as fallback.');
    return getMockServices();
  } catch (error) {
    console.warn('Backend request failed. Returning mock data.', error);
    // Always return mock data as fallback to ensure services are visible to all users
    return getMockServices();
  }
};

const getMockServices = (): Service[] => {
  return [
      {
        id: '1',
        type: 'MAID',
        title: 'Professional House Cleaning',
        description: 'Thorough cleaning service for your home. Experienced and trusted cleaners.',
        price: 500,
        pricingModel: 'PER_JOB',
        providerName: 'Clean Pro Services',
        providerRating: 4.8,
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1563453392-de3fee36e75b?w=400&q=80']
      },
      {
        id: '2',
        type: 'COOK',
        title: 'Daily Home Cooking',
        description: 'Prepare healthy and delicious meals for your family.',
        price: 1200,
        pricingModel: 'PER_MONTH',
        providerName: 'Chef at Home',
        providerRating: 4.9,
        isTrending: true,
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80']
      },
      {
        id: '3',
        type: 'LAUNDRY',
        title: 'Laundry & Ironing Service',
        description: 'Professional laundry service with timely pickup and delivery.',
        price: 300,
        pricingModel: 'PER_JOB',
        providerName: 'Fresh Laundry Co',
        providerRating: 4.6,
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80']
      },
      {
        id: '4',
        type: 'FURNITURE',
        title: 'Custom Furniture Design',
        description: 'Create custom furniture pieces tailored to your space.',
        price: 5000,
        pricingModel: 'ONE_TIME',
        providerName: 'Artisan Furniture',
        providerRating: 4.7,
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80']
      },
      {
        id: '5',
        type: 'APPLIANCE',
        title: 'Appliance Repair & Maintenance',
        description: 'Expert repair service for all major appliances.',
        price: 400,
        pricingModel: 'PER_JOB',
        providerName: 'TechCare Solutions',
        providerRating: 4.5,
        isTrending: true,
        images: ['https://images.unsplash.com/photo-1584622614875-2953ed46f221?w=400&q=80']
      },
      {
        id: '6',
        type: 'MAID',
        title: 'Weekly Home Maintenance',
        description: 'Regular maintenance cleaning service for apartment maintenance.',
        price: 800,
        pricingModel: 'PER_MONTH',
        providerName: 'HomeKeep Services',
        providerRating: 4.4,
        images: ['https://images.unsplash.com/photo-1570194065650-d99fb120b948?w=400&q=80']
      }
    ];
};

export const bookService = async (booking: ServiceBooking): Promise<any> => {
  try {
    const response = await apiClient.post('/services/book', booking);
    return response.data;
  } catch (error) {
    console.error('Error booking service:', error);
    throw error;
  }
};
