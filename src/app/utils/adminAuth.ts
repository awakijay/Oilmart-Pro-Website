import { apiRequest } from './api';

const ADMIN_AUTH_TOKEN_KEY = 'oilmartpro_admin_auth_token';

export function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
}

export function setStoredAdminToken(token: string) {
  localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, token);
}

export function clearStoredAdminToken() {
  localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
}

export async function fetchAdminMe() {
  const token = getStoredAdminToken();

  if (!token) {
    throw new Error('Missing admin token');
  }

  return apiRequest<{ user: { id?: string; username?: string; email: string } }>('/admin/me', {
    auth: true,
    token,
  });
}
