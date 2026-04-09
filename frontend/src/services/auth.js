const STORAGE_KEY = "arrasli_auth_session";

export const getStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const getStoredUser = () => getStoredSession()?.user || null;
export const getStoredToken = () => getStoredSession()?.token || "";

export const saveStoredUser = (payload) => {
  if (payload?.user && payload?.token) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: payload,
      token: "",
    })
  );
};

export const clearStoredUser = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
