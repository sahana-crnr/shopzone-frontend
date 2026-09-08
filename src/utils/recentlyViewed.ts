import { Product } from "../types/shop";

const STORAGE_KEY = "shopzone_recently_viewed";
const MAX_ITEMS = 10;

export function getRecentlyViewed(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("Error reading recently viewed from localStorage", error);
    return [];
  }
}

export function addRecentlyViewed(product: Product): void {
  try {
    if (!product || !product.id) return;
    const existing = getRecentlyViewed();
    const filtered = existing.filter((item) => item.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving recently viewed to localStorage", error);
  }
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed from localStorage", error);
  }
}
