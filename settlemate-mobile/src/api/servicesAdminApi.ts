import apiClient from './client';

export const fetchProviderBookings = async () => {
  const response = await apiClient.get('/services/bookings/provider');
  return response.data?.data ?? response.data;
};

export const updateBookingStatus = async (bookingId: number, status: string) => {
  const response = await apiClient.patch(`/services/bookings/${bookingId}`, { status });
  return response.data;
};

export default {
  fetchProviderBookings,
  updateBookingStatus,
};
