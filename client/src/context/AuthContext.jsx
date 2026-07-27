import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { mapUser } from "../utils/mapUser";

export const AuthContext = createContext(null);

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(user?.id);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authApi.getCurrentUser();
      setUser(mapUser(response?.data?.data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const mappedUser = mapUser(response?.data?.data);
      setUser(mappedUser);
      return mappedUser;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Login failed."));
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const response = await authApi.register(payload);
      return mapUser(response?.data?.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Registration failed."));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The server owns HttpOnly cookies, but the client should still leave the
      // authenticated UI if the logout request cannot complete.
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      isAuthenticated,
      user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [loading, isAuthenticated, user, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
