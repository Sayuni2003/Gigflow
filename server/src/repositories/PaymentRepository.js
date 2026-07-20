import mongoose from "mongoose";
import { PAYMENT_STATUSES } from "../constants/payment.js";
import Payment from "../models/Payment.js";

export const create = (paymentData) => {
  return Payment.create(paymentData);
};

export const aggregateEarningsByFreelancer = (freelancerId) => {
  return Payment.aggregate([
    {
      $match: {
        freelancerId: new mongoose.Types.ObjectId(freelancerId),
        status: PAYMENT_STATUSES.TRANSFERRED,
      },
    },
    {
      $group: {
        _id: "$freelancerId",
        totalEarned: { $sum: "$freelancerPayout" },
        completedOrders: { $sum: 1 },
      },
    },
  ]);
};

export const findByOrderId = (orderId) => {
  return Payment.findOne({ orderId });
};

export const findByUser = (filter) => {
  return Payment.find(filter).sort({ createdAt: -1 });
};

export const save = (paymentDoc) => {
  return paymentDoc.save();
};
