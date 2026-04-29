import { QueryFunctionContext } from "@tanstack/react-query";
import { fetchProducts } from "../api/products";
import { Product } from "../types/shop";

export type ProductFilters = {
  searchTerm: string;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  minReviews: string;
  sortBy: string;
};

export const PRODUCTS_PER_PAGE = 8;

export type ProductsPage = {
  page: number;
  products: Product[];
  totalCount: number;
  hasMore: boolean;
};

export type ProductsQueryKey = ["products", ProductFilters];

const parseNumber = (value: string | number | null | undefined) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const fetchProductsPage = async ({
  pageParam = 1,
  queryKey,
}: QueryFunctionContext<ProductsQueryKey>): Promise<ProductsPage> => {
  const [, filters] = queryKey;
  const normalizedPage =
    typeof pageParam === "number" ? pageParam : Number(pageParam) || 1;

  const response = await fetchProducts({
    search: filters.searchTerm.trim() || undefined,
    min_price: parseNumber(filters.minPrice),
    max_price: parseNumber(filters.maxPrice),
    min_rating:
      filters.minRating === undefined || Number.isNaN(filters.minRating)
        ? undefined
        : filters.minRating,
    min_reviews: parseNumber(filters.minReviews),
    sort: filters.sortBy || "default",
    page: normalizedPage,
    page_size: PRODUCTS_PER_PAGE,
  });

  return {
    page: response.page,
    products: response.results,
    totalCount: response.count,
    hasMore: response.has_more,
  };
};
