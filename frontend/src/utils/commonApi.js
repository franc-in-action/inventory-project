// src/utils/commonApi.js

const backendUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Generic helper for fetch with auth header
 */
export async function apiFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(`${backendUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: "Unknown error" };
    }
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
