import mongoose from "mongoose";
import { PAYMENT_EVENT_TYPE_VALUES } from "../constants/payment.js";

const paymentEventSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: PAYMENT_EVENT_TYPE_VALUES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stripeEventId: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { updatedAt: false },
  },
);

paymentEventSchema.index({ paymentId: 1, createdAt: 1 });

const PaymentEvent = mongoose.model("PaymentEvent", paymentEventSchema);

export default PaymentEvent;
