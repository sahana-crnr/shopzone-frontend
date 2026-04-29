import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { ApiError } from "../api/client";
import useAuthStore from "./useAuthStore";
import { ShopStoreState } from "../types/shop";
import {
  addCartItem,
  addWishlistItem,
  deleteCartItem,
  deleteWishlistItem,
  fetchCart,
  fetchWishlist,
  mapCartResponseToItems,
  mapWishlistResponseToProducts,
  updateCartItem,
} from "../api/commerce";

const isAuthTokenError = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === 401 ||
    error.status === 403 ||
    error.message.toLowerCase().includes("token not valid"));

const useShopStore = create<ShopStoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      discountCode: "",
      discountPercent: 0,
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      setCart: (cart) => set({ cart }),
      setWishlist: (wishlist) => set({ wishlist }),

      syncShop: async () => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
          return;
        }

        try {
          const [cartResponse, wishlistResponse] = await Promise.all([
            fetchCart(accessToken),
            fetchWishlist(accessToken),
          ]);

          set({
            cart: mapCartResponseToItems(cartResponse.items),
            wishlist: mapWishlistResponseToProducts(wishlistResponse),
            discountCode: "",
            discountPercent: 0,
          });
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            return;
          }

          console.error("Unable to sync shop state:", error);
          set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
        }
      },

      addToCart: async (product) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          toast.error("Please log in again to update your cart.");
          return;
        }

        try {
          await addCartItem({ product_id: product.id, quantity: 1 }, accessToken);
          await get().syncShop();
          toast.success("Added to Cart!");
          get().openCart();
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            toast.error("Your session expired. Please log in again.");
            return;
          }

          console.error("Unable to add item to cart:", error);
          toast.error("Unable to add item to cart.");
        }
      },

      updateCartQuantity: async (id, delta) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          toast.error("Please log in again to update your cart.");
          return;
        }

        const cartItem = get().cart.find((item) => item.id === id);

        if (!cartItem) {
          return;
        }

        const nextQuantity = cartItem.quantity + delta;

        if (nextQuantity <= 0) {
          await get().removeFromCart(id);
          return;
        }

        try {
          await updateCartItem(cartItem.cartItemId ?? id, { quantity: nextQuantity }, accessToken);
          await get().syncShop();
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            toast.error("Your session expired. Please log in again.");
            return;
          }

          console.error("Unable to update cart quantity:", error);
          toast.error("Unable to update cart quantity.");
        }
      },

      removeFromCart: async (id) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          toast.error("Please log in again to update your cart.");
          return;
        }

        const cartItem = get().cart.find((item) => item.id === id);
        if (!cartItem) {
          return;
        }

        try {
          await deleteCartItem(cartItem.cartItemId ?? cartItem.id, accessToken);
          await get().syncShop();
          toast.success("Removed from Cart!");
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            toast.error("Your session expired. Please log in again.");
            return;
          }

          console.error("Unable to remove cart item:", error);
          toast.error("Unable to remove cart item.");
        }
      },

      toggleWishlist: async (product) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          toast.error("Please log in again to update your wishlist.");
          return;
        }

        const existingItem = get().wishlist.find((item) => item.id === product.id);

        try {
          if (existingItem) {
            await deleteWishlistItem(
              existingItem.wishlistItemId ?? existingItem.id,
              accessToken,
            );
            toast.success("Removed from Wishlist!");
          } else {
            await addWishlistItem({ product_id: product.id }, accessToken);
            toast.success("Added to Wishlist!");
          }

          await get().syncShop();
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            toast.error("Your session expired. Please log in again.");
            return;
          }

          console.error("Unable to update wishlist:", error);
          toast.error("Unable to update wishlist.");
        }
      },

      removeFromWishlist: async (id) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (!accessToken) {
          toast.error("Please log in again to update your wishlist.");
          return;
        }

        const existingItem = get().wishlist.find((item) => item.id === id);
        if (!existingItem) {
          return;
        }

        try {
          await deleteWishlistItem(
            existingItem.wishlistItemId ?? existingItem.id,
            accessToken,
          );
          await get().syncShop();
          toast.success("Removed from Wishlist!");
        } catch (error) {
          if (isAuthTokenError(error)) {
            useAuthStore.getState().logoutUser();
            set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
            toast.error("Your session expired. Please log in again.");
            return;
          }

          console.error("Unable to remove wishlist item:", error);
          toast.error("Unable to remove wishlist item.");
        }
      },

      applyDiscount: (code) => {
        if (code === "SAVE10") {
          set({ discountCode: code, discountPercent: 10 });
          toast.success("10% discount applied!");
        } else if (code === "SAVE20") {
          set({ discountCode: code, discountPercent: 20 });
          toast.success("20% discount applied!");
        } else {
          toast.error("Invalid discount code!");
        }
      },

      removeDiscount: () => {
        set({ discountCode: "", discountPercent: 0 });
        toast.success("Discount removed!");
      },

      setShop: (cart, wishlist) => {
        set({ cart, wishlist, discountCode: "", discountPercent: 0 });
      },

      clearShop: () => {
        set({ cart: [], wishlist: [], discountCode: "", discountPercent: 0 });
      },
    }),
    {
      name: "shop-storage",
      version: undefined,
    },
  ),
);

export default useShopStore;

export const getCartTotalItems = (state: ShopStoreState) =>
  state.cart.reduce((total, item) => total + item.quantity, 0);
export const getCartTotalPrice = (state: ShopStoreState) =>
  state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
