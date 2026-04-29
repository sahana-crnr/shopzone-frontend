export interface Product {
  id: number;
  name: string;
  size?: string;
  color?: string;
  description?: string;
  price: number;
  image?: string;
  originalPrice?: number;
  rating?: number;
  ratingsCount?: number;
  reviewsCount?: number;
  wishlistItemId?: number;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId?: number;
}

export interface UserProfile {
  id?: number;
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  cart?: CartItem[];
  wishlist?: Product[];
}

export type AuthActionResult = {
  success: boolean;
  message: string;
  field?: "email" | "password" | string;
  user?: UserProfile;
};

export interface AppStoreState {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

export interface UsersStoreState {
  users: UserProfile[];
  addUser: (user: UserProfile) => void;
  updateUser: (email: string, updatedData: Partial<UserProfile>) => void;
}

export interface SearchStoreState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface ThemeStoreState {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  toggleTheme: () => void;
}

export interface ShopStoreState {
  cart: CartItem[];
  wishlist: Product[];
  discountCode: string;
  discountPercent: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCart: (cart: CartItem[]) => void;
  setWishlist: (wishlist: Product[]) => void;
  syncShop: () => Promise<void>;
  addToCart: (product: Product) => Promise<void>;
  updateCartQuantity: (id: number, delta: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
  applyDiscount: (code: string) => void;
  removeDiscount: () => void;
  setShop: (cart: CartItem[], wishlist: Product[]) => void;
  clearShop: () => void;
}

export interface AuthStoreState {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  registerUser: (
    email: string,
    password: string,
    phone: string,
    name: string,
  ) => Promise<AuthActionResult>;
  loginUser: (email: string, password: string) => Promise<AuthActionResult>;
  logoutUser: () => void;
  checkEmailExists: (email: string) => boolean;
  updateUserData: (
    email: string,
    cart: CartItem[],
    wishlist: Product[],
  ) => void;
}
