import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

export const handleAuthError = async (navigation?: any) => {
  try {
    // Clear all stored auth data
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);

    // Update the auth store
    const { handleAuthError: storeHandleAuthError } = useAuthStore.getState();
    await storeHandleAuthError();

    // Navigate to login screen if navigation is provided
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  } catch (error) {
    console.error('Error handling auth error:', error);
  }
};

export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 ||
         error?.message?.includes('Authentication error') ||
         error?.message?.includes('Session expired');
};