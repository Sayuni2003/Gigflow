import Payment from "../models/Payment.js";

export const create = (paymentData) => {
  return Payment.create(paymentData);
};

export const findByOrderId = (orderId) => {
  return Payment.findOne({ orderId });
};

export const save = (paymentDoc) => {
  return paymentDoc.save();
};
