import {
  DISPUTE_STATUSES,
  DISPUTE_STATUS_VALUES,
} from "../constants/disputeStatuses.js";
import { isValidObjectId } from "../utils/objectId.js";

const validateObjectId = (field, value) => {
  if (!isValidObjectId(value)) {
    return {
      field,
      message: "Provide a valid MongoDB ObjectId.",
    };
  }

  return null;
};

const normalizeAttachmentLinks = (value) => {
  if (!value) {
    return [];
  }

  // Handle JSON string from multipart/form-data (same pattern as gig tags).
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(value)) {
    return null;
  }

  return value;
};

export const validateRaiseDisputeInput = (params = {}, payload = {}) => {
  const errors = [];
  const orderId =
    typeof params.orderId === "string" ? params.orderId.trim() : "";
  const orderIdError = validateObjectId("orderId", orderId);

  if (orderIdError) {
    errors.push(orderIdError);
  }

  const reason =
    typeof payload.reason === "string" ? payload.reason.trim() : "";
  const attachments = normalizeAttachmentLinks(payload.attachments);

  if (!reason) {
    errors.push({ field: "reason", message: "Reason is required." });
  } else if (reason.length > 2000) {
    errors.push({
      field: "reason",
      message: "Reason must be at most 2000 characters.",
    });
  }

  if (attachments === null) {
    errors.push({
      field: "attachments",
      message: "Attachments must be an array.",
    });
  } else {
    const hasInvalidAttachment = attachments.some(
      (attachment) =>
        !attachment ||
        typeof attachment.url !== "string" ||
        !attachment.url.trim() ||
        typeof attachment.filename !== "string" ||
        !attachment.filename.trim(),
    );

    if (hasInvalidAttachment) {
      errors.push({
        field: "attachments",
        message: "Each attachment requires a url and filename.",
      });
    }
  }

  return {
    errors,
    value: { orderId, reason, attachments: attachments || [] },
  };
};

export const validateGetDisputeByIdInput = (params = {}) => {
  const errors = [];
  const disputeId =
    typeof params.disputeId === "string" ? params.disputeId.trim() : "";
  const disputeIdError = validateObjectId("disputeId", disputeId);

  if (disputeIdError) {
    errors.push(disputeIdError);
  }

  return {
    errors,
    value: { disputeId },
  };
};

export const validateGetDisputesInput = (query = {}) => {
  const errors = [];
  const status = typeof query.status === "string" ? query.status.trim() : "";

  if (status && !DISPUTE_STATUS_VALUES.includes(status)) {
    errors.push({ field: "status", message: "Invalid status filter." });
  }

  return {
    errors,
    value: { status: status || undefined },
  };
};

export const validateResolveDisputeInput = (params = {}, payload = {}) => {
  const { errors, value } = validateGetDisputeByIdInput(params);
  const decision =
    typeof payload.decision === "string" ? payload.decision.trim() : "";
  const resolutionNote =
    typeof payload.resolutionNote === "string"
      ? payload.resolutionNote.trim()
      : "";

  const ALLOWED_DECISIONS = [
    DISPUTE_STATUSES.REFUND_APPROVED,
    DISPUTE_STATUSES.REFUND_REJECTED,
  ];

  if (!ALLOWED_DECISIONS.includes(decision)) {
    errors.push({
      field: "decision",
      message: "Decision must be REFUND_APPROVED or REFUND_REJECTED.",
    });
  }

  if (resolutionNote.length > 2000) {
    errors.push({
      field: "resolutionNote",
      message: "Resolution note must be at most 2000 characters.",
    });
  }

  return {
    errors,
    value: { ...value, decision, resolutionNote },
  };
};
