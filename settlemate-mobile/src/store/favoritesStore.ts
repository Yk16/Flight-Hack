import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { House } from '../types/housing';

interface FavoritesState {
  favorites: House[];
  toggleFavorite: (house: House) => void;
  isFavorite: (houseId: string | number) => boolean;
  loadFavorites: () => Promise<void>;
}

const STORAGE_KEY = '@settlemate_favorites';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  toggleFavorite: async (house: House) => {
    const current = get().favorites;
    const exists = current.some((h) => String(h.id) === String(house.id));
    let next: House[];

    if (exists) {
      next = current.filter((h) => String(h.id) !== String(house.id));
    } else {
      next = [...current, house];
    }

    set({ favorites: next });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  },

  isFavorite: (houseId: string | number) => {
    return get().favorites.some((h) => String(h.id) === String(houseId));
  },

  loadFavorites: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        set({ favorites: JSON.parse(json) });
      }
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    }
  },
}));
