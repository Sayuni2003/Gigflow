import mongoose from "mongoose";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
} from "../constants/payment.js";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeTransferId: {
      type: String,
      default: null,
    },
    stripeRefundId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    freelancerPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUSES.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ freelancerId: 1, status: 1 });
paymentSchema.index({ clientId: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
