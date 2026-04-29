import { apiRequest } from "./client";

export type AuthUserResponse = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenPairResponse = {
  access: string;
  refresh: string;
};

export async function registerAccount(payload: RegisterPayload) {
  return apiRequest<AuthUserResponse>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAccount(payload: LoginPayload) {
  return apiRequest<TokenPairResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshAccessToken(refresh: string) {
  return apiRequest<{ access: string }>("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export async function fetchCurrentUser(accessToken: string) {
  return apiRequest<AuthUserResponse>("/api/auth/me/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

