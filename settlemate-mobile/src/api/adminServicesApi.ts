import apiClient from './client';

export const servicesAdminApi = {
  // Get pending service providers for verification
  getPendingProviders: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/services/admin/providers', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get detailed information about a specific service provider
  getProviderDetails: async (providerId: number) => {
    const response = await apiClient.get(`/services/admin/providers/${providerId}`);
    return response.data;
  },

  // Approve a service provider
  approveServiceProvider: async (providerId: number) => {
    const response = await apiClient.patch(`/services/admin/providers/${providerId}/verify`, {
      status: 'APPROVED',
    });
    return response.data;
  },

  // Reject a service provider
  rejectServiceProvider: async (providerId: number, rejectionReason: string) => {
    const response = await apiClient.patch(`/services/admin/providers/${providerId}/verify`, {
      status: 'REJECTED',
      rejectionReason,
    });
    return response.data;
  },
};
