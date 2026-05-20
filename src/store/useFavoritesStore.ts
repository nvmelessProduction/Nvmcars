import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as favoritesService from "@/services/favorites";

type FavoritesState = {
  ids: string[];
  hydrate: (userId: string) => Promise<void>;
  isFavorite: (workshopId: string) => boolean;
  toggle: (userId: string | undefined, workshopId: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrate: async (userId) => {
        const remote = await favoritesService.listMyFavorites(userId);
        if (remote.length > 0 || get().ids.length === 0) {
          set({ ids: remote });
        }
      },
      isFavorite: (id) => get().ids.includes(id),
      toggle: (userId, id) => {
        const wasFav = get().ids.includes(id);
        set({
          ids: wasFav ? get().ids.filter((x) => x !== id) : [...get().ids, id],
        });
        if (!userId) return;
        const op = wasFav
          ? favoritesService.removeFavoriteRemote(userId, id)
          : favoritesService.addFavoriteRemote(userId, id);
        op.catch(() => {
          // Rollback se il sync remoto fallisce.
          set({
            ids: wasFav ? [...get().ids, id] : get().ids.filter((x) => x !== id),
          });
        });
      },
    }),
    {
      name: "nvmcars-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
