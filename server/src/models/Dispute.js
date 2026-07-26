import mongoose from "mongoose";
import {
  DISPUTE_STATUSES,
  DISPUTE_STATUS_VALUES,
} from "../constants/disputeStatuses.js";

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },
  },
  { _id: false },
);

const disputeSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: DISPUTE_STATUS_VALUES,
      default: DISPUTE_STATUSES.PENDING,
      required: true,
    },
    // The order's status at the moment the dispute was raised, so a
    // REFUND_REJECTED resolution can restore it instead of leaving the
    // order stuck in DISPUTED.
    statusBeforeDispute: {
      type: String,
      required: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

disputeSchema.index({ orderId: 1, createdAt: -1 });

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
