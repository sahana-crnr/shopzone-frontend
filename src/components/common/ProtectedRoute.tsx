import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}
