import client from "./client";
import { PAYMENT_ENDPOINTS } from "../config/endpoints";

export const getPayments = () => {
  return client.get(PAYMENT_ENDPOINTS.base);
};

export const onboardFreelancer = () => {
  return client.post(PAYMENT_ENDPOINTS.onboardFreelancer);
};

export const getFreelancerEarnings = () => {
  return client.get(PAYMENT_ENDPOINTS.earnings);
};
