import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http, setAuthToken } from "../api/http";

const AuthContext = createContext(null);

const TOKEN_KEY = "accessToken";

export function AuthProvider({ children }) {
  // 1) Token persists across refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  // 2) User is fetched from backend (/me)
  const [user, setUser] = useState(null);
  // 3) Loading is important so route guards don’t misfire on initial boot
  const [loading, setLoading] = useState(true);

  // Whenever token changes, update axios header globally
  useEffect(() => { setAuthToken(token) }, [token]);

  // Fetch "who am I" from the backend
  async function fetchMe() {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await http.get("/api/auth/me");
      setUser(res.data.user); // expects { email, role, ... }
    } catch (e) {
      // Token invalid/expired/etc => clear it
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // On app start, validate token by calling /me once
  useEffect(() => {
    fetchMe();
  }, [token]);

  // Login: get token from server, store it, then fetch /me
  async function login(email, password) {
    const res = await http.post("/api/auth/login", { email, password });
    const t = res.data?.accessToken || res.data?.token;

    if (!t) throw new Error("Auth response missing token");

    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);

    setLoading(true);
    await fetchMe();
  }


  // Register: same pattern
  async function register(email, password) {
    const res = await http.post("/api/auth/register", { email, password });
    const t = res.data?.accessToken || res.data?.token;

    if (!t) throw new Error("Auth response missing token");

    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);

    setLoading(true);
    await fetchMe();
  }


  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setAuthToken("");
  }

  // Memo avoids re-rendering consumers unnecessarily
  const value = useMemo(
    () => ({ token, user, loading, login, register, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
