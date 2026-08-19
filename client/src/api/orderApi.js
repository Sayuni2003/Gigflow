import client from "./client";
import { ORDER_ENDPOINTS } from "../config/endpoints";

export const getOrders = () => {
  return client.get(ORDER_ENDPOINTS.base);
};

export const getOrderById = (orderId) => {
  return client.get(ORDER_ENDPOINTS.byId(orderId));
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

export const getOrderDeliveries = (orderId) => {
  return client.get(ORDER_ENDPOINTS.deliveries(orderId));
};

export const deliverOrder = (orderId, formData) => {
  return client.post(ORDER_ENDPOINTS.deliver(orderId), formData, {
    headers: { "Content-Type": undefined },
  });
};

export const requestRevision = (orderId, message) => {
  return client.post(ORDER_ENDPOINTS.requestRevision(orderId), { message });
};

// Distinct from acceptOrder above: this hits the client-side "confirm
// delivery" endpoint (releases payout, marks COMPLETED), not the
// freelancer's accept-into-progress status patch.
export const completeOrder = (orderId) => {
  return client.post(ORDER_ENDPOINTS.complete(orderId));
};

export const raiseDispute = (orderId, formData) => {
  return client.post(ORDER_ENDPOINTS.disputes(orderId), formData, {
    headers: { "Content-Type": undefined },
  });
};
