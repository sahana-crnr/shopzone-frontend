import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setAuthTokens = useAuthStore((state) => state.setAuthTokens);
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  const refreshParam = searchParams.get("refresh");
  const [isRestoring, setIsRestoring] = useState(Boolean(tokenParam));

  useEffect(() => {
    if (tokenParam) {
      void setAuthTokens(tokenParam, refreshParam || undefined).finally(() => {
        setIsRestoring(false);
      });
    }
  }, [tokenParam, refreshParam, setAuthTokens]);

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}
