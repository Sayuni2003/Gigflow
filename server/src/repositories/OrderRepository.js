import Order from "../models/Order.js";

export const createOrder = (orderData) => {
  return Order.create(orderData);
};

export const getOrderById = (orderId) => {
  return Order.findById(orderId);
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
