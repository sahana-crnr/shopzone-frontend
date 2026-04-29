import { create } from "zustand";
import { ThemeStoreState } from "../types/shop";

const THEME_STORAGE_KEY = "shopzone-theme";

const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark") {
    return true;
  }
  if (storedTheme === "light") {
    return false;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
};

const persistTheme = (isDark: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
};

const useThemeStore = create<ThemeStoreState>((set) => ({
  isDark: getInitialTheme(),
  setIsDark: (value) => {
    persistTheme(value);
    set({ isDark: value });
  },
  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      persistTheme(next);
      return { isDark: next };
    }),
}));

export default useThemeStore;
