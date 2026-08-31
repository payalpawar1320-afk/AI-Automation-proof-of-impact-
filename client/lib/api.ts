/**
 * Centralized API client helper for Proof of Impact
 * In development: defaults to http://localhost:5000 (Express Backend)
 * In production on Vercel: uses NEXT_PUBLIC_API_URL (Render Backend URL)
 */

export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const cleanEndpoint = endpoint ? (endpoint.startsWith('/') ? endpoint : `/${endpoint}`) : '';
  return `${baseUrl}${cleanEndpoint}`;
};

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
}
