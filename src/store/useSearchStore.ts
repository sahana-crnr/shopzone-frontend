import { create } from "zustand";
import { SearchStoreState } from "../types/shop";

const useSearchStore = create<SearchStoreState>((set) => ({
  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
  selectedCategory: "",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

export default useSearchStore;
