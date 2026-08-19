import client from "./client";
import { ORDER_ENDPOINTS, USER_ENDPOINTS } from "../config/endpoints";

export const getOrderRating = (orderId) => {
  return client.get(ORDER_ENDPOINTS.rating(orderId));
};

export const createRating = (orderId, { rating, comment }) => {
  return client.post(ORDER_ENDPOINTS.rating(orderId), { rating, comment });
};

export const updateRating = (orderId, { rating, comment }) => {
  return client.patch(ORDER_ENDPOINTS.rating(orderId), { rating, comment });
};

export const deleteRating = (orderId) => {
  return client.delete(ORDER_ENDPOINTS.rating(orderId));
};

export const getFreelancerRatings = (freelancerId) => {
  return client.get(USER_ENDPOINTS.ratings(freelancerId));
};
