import client from "./client";
import { GIG_ENDPOINTS } from "../config/endpoints";

export const getCategories = () => {
  return client.get(GIG_ENDPOINTS.categories);
};

export const getGigs = (params) => {
  return client.get(GIG_ENDPOINTS.base, { params });
};
