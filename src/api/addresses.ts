import { apiRequest } from "./client";

export type AddressType = "HOME" | "WORK" | "OTHER";

export type CustomerAddress = {
  id: number;
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: AddressType;
  is_default: boolean;
  full_address: string;
  created_at: string;
  updated_at: string;
};

export type AddressPayload = {
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  address_type?: AddressType;
  is_default?: boolean;
};

export async function fetchCustomerAddresses(accessToken: string) {
  return apiRequest<CustomerAddress[]>("/api/auth/addresses/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createCustomerAddress(
  payload: AddressPayload,
  accessToken: string,
) {
  return apiRequest<CustomerAddress>("/api/auth/addresses/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCustomerAddress(
  id: number,
  payload: Partial<AddressPayload>,
  accessToken: string,
) {
  return apiRequest<CustomerAddress>(`/api/auth/addresses/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomerAddress(id: number, accessToken: string) {
  return apiRequest<void>(`/api/auth/addresses/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function setDefaultCustomerAddress(
  id: number,
  accessToken: string,
) {
  return apiRequest<CustomerAddress>(`/api/auth/addresses/${id}/default/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
