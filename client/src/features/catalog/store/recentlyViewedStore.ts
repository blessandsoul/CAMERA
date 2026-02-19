'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENTLY_VIEWED = 10;

interface RecentlyViewedStore {
  ids: string[];
  addViewed: (id: string) => void;
  clearViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      ids: [],

      addViewed: (id: string) => {
        set((state) => {
          const filtered = state.ids.filter((i) => i !== id);
          return { ids: [id, ...filtered].slice(0, MAX_RECENTLY_VIEWED) };
        });
      },

      clearViewed: () => set({ ids: [] }),
    }),
    {
      name: 'techbrain-recently-viewed',
    }
  )
);
