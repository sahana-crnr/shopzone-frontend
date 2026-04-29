import { apiRequest } from "./client";
import { CartItem, Product } from "../types/shop";

export type CartItemResponse = {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
};

export type CartResponse = {
  id: number;
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
};

export type WishlistItemResponse = {
  id: number;
  product: Product;
  created_at: string;
};

export type WishlistResponse = WishlistItemResponse[];

export type CartUpsertPayload = {
  product_id: number;
  quantity?: number;
};

export type CartUpdatePayload = {
  quantity: number;
};

export type WishlistUpsertPayload = {
  product_id: number;
};

export async function fetchCart(accessToken: string) {
  return apiRequest<CartResponse>("/api/cart/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function addCartItem(payload: CartUpsertPayload, accessToken: string) {
  return apiRequest<CartResponse>("/api/cart/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(
  itemId: number,
  payload: CartUpdatePayload,
  accessToken: string,
) {
  return apiRequest<{ id: number; quantity: number }>(`/api/cart/items/${itemId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteCartItem(itemId: number, accessToken: string) {
  return apiRequest<void>(`/api/cart/items/${itemId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function fetchWishlist(accessToken: string) {
  return apiRequest<WishlistResponse>("/api/wishlist/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function addWishlistItem(
  payload: WishlistUpsertPayload,
  accessToken: string,
) {
  return apiRequest<{ id: number; product: Product }>("/api/wishlist/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteWishlistItem(itemId: number, accessToken: string) {
  return apiRequest<void>(`/api/wishlist/items/${itemId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export const mapCartResponseToItems = (items: CartItemResponse[]): CartItem[] =>
  items.map((item) => ({
    ...item.product,
    id: item.product.id,
    cartItemId: item.id,
    quantity: item.quantity,
  }));

export const mapWishlistResponseToProducts = (
  items: WishlistItemResponse[],
): Product[] =>
  items.map((item) => ({
    ...item.product,
    id: item.product.id,
    wishlistItemId: item.id,
  }));
