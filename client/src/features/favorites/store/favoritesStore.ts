'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  ids: string[];
  compareIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  isComparing: (id: string) => boolean;
  clearCompare: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      compareIds: [],

      toggleFavorite: (id: string) => {
        set((state) => {
          const exists = state.ids.includes(id);
          return {
            ids: exists
              ? state.ids.filter((i) => i !== id)
              : [...state.ids, id],
            // Also remove from compare if unfavorited
            compareIds: exists
              ? state.compareIds.filter((i) => i !== id)
              : state.compareIds,
          };
        });
      },

      isFavorite: (id: string) => get().ids.includes(id),

      toggleCompare: (id: string) => {
        set((state) => {
          const exists = state.compareIds.includes(id);
          if (exists) {
            return { compareIds: state.compareIds.filter((i) => i !== id) };
          }
          if (state.compareIds.length >= 3) return state;
          return { compareIds: [...state.compareIds, id] };
        });
      },

      isComparing: (id: string) => get().compareIds.includes(id),

      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'techbrain-favorites',
    }
  )
);
