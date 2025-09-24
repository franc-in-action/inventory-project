const backendUrl = import.meta.env.VITE_BACKEND_URL;

function getToken() {
  return localStorage.getItem("token");
}

/**
 * Generic helper for fetch with auth header
 */
export async function apiFetch(
  url,
  options = {},
  { raw = false, skipJsonHeader = false } = {}
) {
  const token = getToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  if (!skipJsonHeader) headers["Content-Type"] = "application/json";

  const res = await fetch(`${backendUrl}${url}`, { ...options, headers });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: "Unknown error" };
    }
    throw new Error(err?.error || `Request failed: ${res.status}`);
  }

  return raw ? res : res.json(); // ✅ correctly return Response if raw
}
