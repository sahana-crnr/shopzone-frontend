import { Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";
import useShopStore from "./store/useShopStore";
import useThemeStore from "./store/useThemeStore";
import { lazyWithRetry } from "./utils/lazyWithRetry";

const Login = lazyWithRetry(() => import("./pages/Login"));
const Register = lazyWithRetry(() => import("./pages/Register"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const Home = lazyWithRetry(() => import("./pages/Home"));
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const ProductDetails = lazyWithRetry(() => import("./pages/ProductDetails"));
const Wishlist = lazyWithRetry(() => import("./pages/Wishlist"));
const Cart = lazyWithRetry(() => import("./pages/Cart"));
const Account = lazyWithRetry(() => import("./pages/Account"));
const Addresses = lazyWithRetry(() => import("./pages/Addresses"));
const Orders = lazyWithRetry(() => import("./pages/Orders"));

function App() {
  const isDark = useThemeStore((state) => state.isDark);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const accessToken = useAuthStore((state) => state.accessToken);
  const syncShop = useShopStore((state) => state.syncShop);
  const clearShop = useShopStore((state) => state.clearShop);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!isLoggedIn || !accessToken) {
      clearShop();
      return;
    }

    void syncShop();
  }, [accessToken, clearShop, isLoggedIn, syncShop]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
