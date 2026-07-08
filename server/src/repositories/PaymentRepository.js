import Payment from "../models/Payment.js";

export const create = (paymentData) => {
  return Payment.create(paymentData);
};
