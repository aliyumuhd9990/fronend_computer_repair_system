import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const access = localStorage.getItem("fixdesk_access");
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me/");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
    const expire = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("fixdesk:session-expired", expire);
    return () => window.removeEventListener("fixdesk:session-expired", expire);
  }, [loadMe]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("fixdesk_access", data.access);
    localStorage.setItem("fixdesk_refresh", data.refresh);
    const profile = await api.get("/auth/me/");
    setUser(profile.data);
    return profile.data;
  };

  const register = async (payload) => {
    await api.post("/auth/register/", payload);
    return login(payload.username, payload.password);
  };

  const logout = async () => {
    const refresh = localStorage.getItem("fixdesk_refresh");
    try {
      if (refresh) await api.post("/auth/logout/", { refresh });
    } catch {
      // Local logout still succeeds if the server cannot be reached.
    }
    localStorage.removeItem("fixdesk_access");
    localStorage.removeItem("fixdesk_refresh");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, reloadUser: loadMe }), [user, loading, loadMe]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
