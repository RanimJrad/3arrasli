const STORAGE_KEY = "arrasli_user";

export const ROLE_ROUTES = {
  Admin: "/admin",
  Prestataire: "/prestataire",
};

export const getStoredUser = () => {
  try {
    const rawUser = window.localStorage.getItem(STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
};

export const saveStoredUser = (user) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

export const hasRole = (user, role) => user?.role === role;

export const getDashboardPathForUser = (user) => ROLE_ROUTES[user?.role] || "/";
