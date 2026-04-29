import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppStoreState } from "./types/shop";

const useStore = create<AppStoreState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userProfile: null,
      login: (profile) => set({ isLoggedIn: true, userProfile: profile }),
      logout: () => set({ isLoggedIn: false, userProfile: null }),
    }),
    {
      name: "app-storage",
      version: undefined,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useStore;
