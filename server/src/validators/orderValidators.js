import { ORDER_STATUSES } from "../constants/orderStatuses.js";
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

export const validateCreateOrderInput = (payload = {}) => {
  const errors = [];
  const gigId = typeof payload.gigId === "string" ? payload.gigId.trim() : "";
  const gigIdError = validateObjectId("gigId", gigId);

  if (gigIdError) {
    errors.push(gigIdError);
  }

  return {
    errors,
    value: {
      gigId,
    },
  };
};

export const validateGetOrderByIdInput = (params = {}) => {
  const errors = [];
  const orderId =
    typeof params.orderId === "string" ? params.orderId.trim() : "";
  const orderIdError = validateObjectId("orderId", orderId);

  if (orderIdError) {
    errors.push(orderIdError);
  }

  return {
    errors,
    value: {
      orderId,
    },
  };
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

export const validateDeliverOrderInput = (params = {}, payload = {}) => {
  const { errors, value } = validateGetOrderByIdInput(params);
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const attachments = normalizeAttachmentLinks(payload.attachments);

  if (!message) {
    errors.push({ field: "message", message: "Message is required." });
  } else if (message.length > 2000) {
    errors.push({
      field: "message",
      message: "Message must be at most 2000 characters.",
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
    value: { ...value, message, attachments: attachments || [] },
  };
};

export const validateRequestRevisionInput = (params = {}, payload = {}) => {
  const { errors, value } = validateGetOrderByIdInput(params);
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";

  return {
    errors,
    value: { ...value, message },
  };
};

export const validateUpdateOrderStatusInput = (params = {}, payload = {}) => {
  const { errors, value } = validateGetOrderByIdInput(params);
  const status = typeof payload.status === "string" ? payload.status.trim() : "";

  const ALLOWED_STATUS_VALUES = [
    ORDER_STATUSES.IN_PROGRESS,
    ORDER_STATUSES.REJECTED,
    ORDER_STATUSES.CANCELLED,
  ];

  if (!ALLOWED_STATUS_VALUES.includes(status)) {
    errors.push({
      field: "status",
      message: "Status must be IN_PROGRESS, REJECTED, or CANCELLED.",
    });
  }

  return {
    errors,
    value: {
      ...value,
      status,
    },
  };
};
