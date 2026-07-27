import axios from "axios";
import env from "../config/env";
import { AUTH_ENDPOINTS } from "../config/endpoints";

const refreshSkipPaths = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.register,
  AUTH_ENDPOINTS.refresh,
  AUTH_ENDPOINTS.logout,
];

let refreshRequest = null;

const client = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const isRefreshSkipRequest = (requestUrl) => {
  return refreshSkipPaths.some((path) => requestUrl.includes(path));
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const requestUrl = String(originalRequest?.url || "");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshSkipRequest(requestUrl)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = client
            .post(AUTH_ENDPOINTS.refresh)
            .finally(() => {
              refreshRequest = null;
            });
        }

        await refreshRequest;
        return client(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
