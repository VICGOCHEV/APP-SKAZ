import axios from 'axios';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export function mockDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}
