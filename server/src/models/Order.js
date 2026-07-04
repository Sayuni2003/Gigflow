import mongoose from "mongoose";
import {
  ORDER_STATUSES,
  ORDER_STATUS_VALUES,
} from "../constants/orderStatuses.js";
import { GIG_CATEGORIES } from "../constants/gigCategories.js";

const orderSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    gigSnapshot: {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,
        required: true,
        enum: GIG_CATEGORIES,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      deliveryTime: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUSES.PENDING_ACCEPTANCE,
      required: true,
    },
    deliveryDeadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ clientId: 1, createdAt: -1 });
orderSchema.index({ freelancerId: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
