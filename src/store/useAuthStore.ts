import { create } from "zustand";
import { persist } from "zustand/middleware";
import useUsersStore from "./useUsersStore";
import { AuthActionResult, AuthStoreState, UserProfile } from "../types/shop";
import {
  fetchCurrentUser,
  loginAccount,
  registerAccount,
} from "../api/auth";
import { ApiError } from "../api/client";

const authStorageName = "auth-storage-backend";

const toUserProfile = (user: {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}): UserProfile => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? "",
  cart: [],
  wishlist: [],
});

const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,

      registerUser: async (email, password, phone, name): Promise<AuthActionResult> => {
        try {
          const user = await registerAccount({
            name,
            email,
            phone,
            password,
          });

          useUsersStore.getState().addUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            password: "",
            cart: [],
            wishlist: [],
          });

          return {
            success: true,
            message: "Account created successfully!",
            user: toUserProfile(user),
          };
        } catch (error) {
          if (error instanceof ApiError) {
            const field = error.message.toLowerCase().includes("email")
              ? "email"
              : "password";

            return {
              success: false,
              message: error.message,
              field,
            };
          }

          return {
            success: false,
            message: "Unable to create account. Please try again.",
          };
        }
      },

      loginUser: async (email, password): Promise<AuthActionResult> => {
        try {
          const tokens = await loginAccount({ email, password });
          const currentUser = await fetchCurrentUser(tokens.access);

          const user = toUserProfile(currentUser);

          set({
            currentUser: user,
            isLoggedIn: true,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
          });

          return {
            success: true,
            message: "You are logged in successfully!",
            user,
          };
        } catch (error) {
          if (error instanceof ApiError) {
            return {
              success: false,
              message: error.message,
              field: "email",
            };
          }

          return {
            success: false,
            message: "Unable to log in. Please try again.",
            field: "email",
          };
        }
      },

      logoutUser: () => {
        set({
          currentUser: null,
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
        });
      },

      checkEmailExists: (email) => {
        const users = useUsersStore.getState().users;
        const currentUser = get().currentUser;
        return (
          users.some((user) => user.email === email) ||
          currentUser?.email === email
        );
      },

      updateUserData: (email, cart, wishlist) => {
        useUsersStore.getState().updateUser(email, { cart, wishlist });
      },
    }),
    {
      name: authStorageName,
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

export default useAuthStore;
