import { apiRequest } from "./client";
import { Product } from "../types/shop";

export type ProductFilters = {
  searchTerm: string;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  minReviews: string;
  sortBy: string;
};

export type ProductsApiResponse = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
  results: Product[];
};

export type ProductListParams = {
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  min_reviews?: number;
  sort?: string;
  page?: number;
  page_size?: number;
};

const buildQueryString = (params: ProductListParams) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchProducts(params: ProductListParams = {}) {
  return apiRequest<ProductsApiResponse>(
    `/api/products/${buildQueryString(params)}`,
  );
}

export async function fetchProductById(id: number) {
  return apiRequest<Product>(`/api/products/${id}/`);
}

export async function fetchProductCatalog() {
  const response = await fetchProducts({ page: 1, page_size: 100 });
  return response.results;
}

