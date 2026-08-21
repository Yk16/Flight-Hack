import apiClient from './client';

export interface CreateBookingRequest {
  houseId: number;
  message?: string;
  checkInDate?: string;
}

export interface Booking {
  id: number;
  houseId: number;
  tenantId: number;
  ownerId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  checkInDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a house booking request
 */
export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  try {
    const response = await apiClient.post('/bookings', data);
    console.log('[bookingApi] Booking created:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('[bookingApi] Error creating booking:', error);
    throw error;
  }
};

/**
 * Get user's bookings (as tenant)
 */
export const getMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get('/bookings/my');
    console.log('[bookingApi] Fetched my bookings:', response.data);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('[bookingApi] Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Get owner's booking requests
 */
export const getOwnerBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get('/bookings/owner/my');
    console.log('[bookingApi] Fetched owner bookings:', response.data);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('[bookingApi] Error fetching owner bookings:', error);
    throw error;
  }
};

/**
 * Get booking details
 */
export const getBooking = async (bookingId: number): Promise<Booking> => {
  try {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    console.log('[bookingApi] Fetched booking:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('[bookingApi] Error fetching booking:', error);
    throw error;
  }
};

/**
 * Update booking status (accept/reject/cancel)
 */
export const updateBookingStatus = async (bookingId: number, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'): Promise<Booking> => {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
    console.log('[bookingApi] Booking status updated:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('[bookingApi] Error updating booking status:', error);
    throw error;
  }
};
