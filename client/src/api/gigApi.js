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

export const getMyGigs = () => {
  return client.get(GIG_ENDPOINTS.myGigs);
};

export const createGig = (formData) => {
  return client.post(GIG_ENDPOINTS.base, formData, {
    headers: { "Content-Type": undefined },
  });
};

export const updateGig = (id, formData) => {
  return client.put(GIG_ENDPOINTS.byId(id), formData, {
    headers: { "Content-Type": undefined },
  });
};

export const deleteGig = (id) => {
  return client.delete(GIG_ENDPOINTS.byId(id));
};
