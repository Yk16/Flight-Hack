export type ServiceType = 'MAID' | 'COOK' | 'LAUNDRY' | 'FURNITURE' | 'APPLIANCE';
export type PricingModel = 'PER_MONTH' | 'PER_JOB' | 'ONE_TIME';

export interface Service {
  id: string;
  type: ServiceType;
  title: string;
  description?: string;
  price: number;
  pricingModel: PricingModel;
  images?: string[];
  providerId?: string;
  providerName?: string;
  providerRating?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceBooking {
  listingId: string;
  startDate?: string;
  endDate?: string;
  totalAmount: number;
}
