import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UsersStoreState } from "../types/shop";

const useUsersStore = create<UsersStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (user) => {
        const { users } = get();
        set({ users: [...users, user] });
      },
      updateUser: (email, updatedData) => {
        const { users } = get();
        const updatedUsers = users.map((user) =>
          user.email === email ? { ...user, ...updatedData } : user,
        );

        set({ users: updatedUsers });
      },
    }),
    {
      name: "users-storage",
      version: undefined,
    },
  ),
);

export default useUsersStore;
