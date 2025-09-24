const backendUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Generic helper for fetch with auth header
 * @param {string} url - API endpoint (relative)
 * @param {object} options - fetch options
 * @param {boolean} options.raw - if true, return raw fetch Response
 */
export async function apiFetch(url, options = {}) {
  const { raw, ...fetchOptions } = options;
  const token = getToken();

  const res = await fetch(`${backendUrl}${url}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(fetchOptions.headers || {}),
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

  if (raw) return res; // return raw Response for blob/download handling
  return res.json();
}
