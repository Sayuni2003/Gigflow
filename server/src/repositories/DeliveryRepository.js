import Delivery from "../models/Delivery.js";

export const createDelivery = (deliveryData) => {
  return Delivery.create(deliveryData);
};

export const countByOrderId = (orderId) => {
  return Delivery.countDocuments({ orderId });
};
