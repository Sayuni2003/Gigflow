import { ORDER_STATUSES } from "../constants/orderStatuses.js";
import Order from "../models/Order.js";

export const createOrder = (orderData) => {
  return Order.create(orderData);
};

export const findDeliveredPastDeadline = () => {
  return Order.find({
    status: ORDER_STATUSES.DELIVERED,
    deliveryDeadline: { $lte: new Date() },
  });
};

export const findInProgressPastDeadline = () => {
  return Order.find({
    status: ORDER_STATUSES.IN_PROGRESS,
    deliveryDeadline: { $lte: new Date() },
  });
};

export const getOrderById = (orderId) => {
  return Order.findById(orderId);
};

export const getOrderByIdWithParties = (orderId) => {
  return Order.findById(orderId)
    .populate("clientId", "fullName")
    .populate("freelancerId", "fullName");
};

export const getOrdersByUser = (filter) => {
  return Order.find(filter).sort({ createdAt: -1 });
};

export const deleteOrder = (orderId) => {
  return Order.findByIdAndDelete(orderId);
};

export const updateOrder = (orderId, updateData) => {
  return Order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};
