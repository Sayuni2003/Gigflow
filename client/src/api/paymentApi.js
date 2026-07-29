import client from "./client";
import { PAYMENT_ENDPOINTS } from "../config/endpoints";

export const getPayments = () => {
  return client.get(PAYMENT_ENDPOINTS.base);
};
