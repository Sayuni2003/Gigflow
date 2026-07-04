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
