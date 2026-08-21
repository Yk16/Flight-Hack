import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isAdmin: boolean;
  isOwner: boolean;
  isProvider: boolean;
  status?: 'PENDING' | 'VERIFIED' | 'BLOCKED';
  aadhaarVerified?: boolean;
  panVerified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (user: User, token: string, refresh?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  handleAuthError: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  login: async (user, token, refresh) => {
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    if (refresh) {
      await AsyncStorage.setItem('refreshToken', refresh);
    }
    set({ user, accessToken: token, refreshToken: refresh ?? null, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const refresh = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        set({ user: JSON.parse(userData), accessToken: token, refreshToken: refresh, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Session restoral error:', error);
      set({ isLoading: false });
    }
  },

  handleAuthError: async () => {
    console.log('Handling authentication error - clearing session');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
  },
}));
