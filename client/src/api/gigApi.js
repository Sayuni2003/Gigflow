import client from "./client";
import { GIG_ENDPOINTS } from "../config/endpoints";

export const getCategories = () => {
  return client.get(GIG_ENDPOINTS.categories);
};

export const getGigs = (params) => {
  return client.get(GIG_ENDPOINTS.base, { params });
};

export const getGig = (id) => {
  return client.get(GIG_ENDPOINTS.byId(id));
};

export const getGigFreelancer = (gigId) => {
  return client.get(GIG_ENDPOINTS.freelancer(gigId));
};
