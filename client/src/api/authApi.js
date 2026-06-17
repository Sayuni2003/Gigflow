import client from "./client";
import { AUTH_ENDPOINTS } from "../config/endpoints";

export const login = (payload) => {
  return client.post(AUTH_ENDPOINTS.login, payload);
};

export const register = (payload) => {
  return client.post(AUTH_ENDPOINTS.register, payload);
};

export const getCurrentUser = () => {
  return client.get(AUTH_ENDPOINTS.me);
};

export const refresh = () => {
  return client.post(AUTH_ENDPOINTS.refresh);
};

export const logout = () => {
  return client.post(AUTH_ENDPOINTS.logout);
};
