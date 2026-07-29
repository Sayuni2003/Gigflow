import client from "./client";
import { ORDER_ENDPOINTS } from "../config/endpoints";

export const getOrders = () => {
  return client.get(ORDER_ENDPOINTS.base);
};

export const createOrder = (gigId) => {
  return client.post(ORDER_ENDPOINTS.base, { gigId });
};

export const getOrderFreelancer = (orderId) => {
  return client.get(ORDER_ENDPOINTS.freelancer(orderId));
};

export const getOrderClient = (orderId) => {
  return client.get(ORDER_ENDPOINTS.client(orderId));
};

export const getOrderPayment = (orderId) => {
  return client.get(ORDER_ENDPOINTS.payment(orderId));
};

export const cancelOrder = (orderId) => {
  return client.patch(ORDER_ENDPOINTS.status(orderId), { status: "CANCELLED" });
};

export const acceptOrder = (orderId) => {
  return client.patch(ORDER_ENDPOINTS.status(orderId), { status: "IN_PROGRESS" });
};

export const rejectOrder = (orderId) => {
  return client.patch(ORDER_ENDPOINTS.status(orderId), { status: "REJECTED" });
};
