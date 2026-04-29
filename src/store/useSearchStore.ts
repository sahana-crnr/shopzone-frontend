import { create } from "zustand";
import { SearchStoreState } from "../types/shop";

const useSearchStore = create<SearchStoreState>((set) => ({
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
}));

export default useSearchStore;
