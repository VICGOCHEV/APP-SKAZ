import axios from 'axios';

/**
 * Toggle between mocks (default, for dev without backend) and real API.
 * Set `VITE_USE_MOCKS=false` in .env.local to hit the real endpoint.
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

export const AUTH_TOKEN_KEY = 'skazka:token';

export function getAuthToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // storage unavailable — silently ignore
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401, optionally clear token — caller handles redirect.
    if (error?.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  },
);

export function mockDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}
