// src/utils/authApi.js
export const TOKEN_KEY = "token";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // contains userId, role, name
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

// --- Centralized role check ---
export function userHasRole(allowedRoles = []) {
  const user = getUserFromToken();
  if (!user || !user.role) return false;

  const userRole = user.role.toLowerCase();
  return allowedRoles.some((role) => role.toLowerCase() === userRole);
}

// --- Replace old hasRole ---
export const hasRole = userHasRole;

// --- Default page per role ---
export function getDefaultPage() {
  const user = getUserFromToken();
  if (!user) return "/login";

  const role = user.role.toLowerCase();
  switch (role) {
    case "admin":
    case "manager":
    case "staff":
      return "/dashboard";
    default:
      return "/login";
  }
}

// --- Login helper ---
export async function login({ email, password }) {
  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      saveToken(data.token);

      if (window.electronAPI) {
        window.electronAPI.authSuccess(data.token);
      }

      return { success: true, token: data.token };
    } else {
      return { success: false, error: data.error || "Login failed" };
    }
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function logout(navigate) {
  clearToken();
  if (navigate) navigate("/login");
  if (window.electronAPI) window.electronAPI.authLogout?.();
}

// Optional: navigate to default page based on role
export function goToDefaultPage(navigate) {
  const defaultPage = getDefaultPage();
  if (navigate) navigate(defaultPage);
  else window.location.href = defaultPage;
}
