import client from "./client";
import { USER_ENDPOINTS } from "../config/endpoints";

export const getUser = (userId) => {
  return client.get(USER_ENDPOINTS.byId(userId));
};

export const updateUser = (userId, payload) => {
  return client.patch(USER_ENDPOINTS.byId(userId), payload);
};

export const changePassword = (userId, payload) => {
  return client.patch(USER_ENDPOINTS.changePassword(userId), payload);
};

export const deleteUser = (userId) => {
  return client.delete(USER_ENDPOINTS.byId(userId));
};
