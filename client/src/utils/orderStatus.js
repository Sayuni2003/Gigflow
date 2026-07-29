export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: "Pending payment",
  PENDING_ACCEPTANCE: "Pending acceptance",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  REVISION_REQUESTED: "Revision requested",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
};

const ORDER_STATUS_CLASSNAMES = {
  PENDING_PAYMENT: "bg-warning-soft text-warning-text",
  PENDING_ACCEPTANCE: "bg-warning-soft text-warning-text",
  IN_PROGRESS: "bg-primary-soft text-primary",
  DELIVERED: "bg-primary-soft text-primary",
  REVISION_REQUESTED: "bg-warning-soft text-warning-text",
  COMPLETED: "bg-success-soft text-success-text",
  REJECTED: "bg-danger-soft text-danger-text",
  CANCELLED: "bg-danger-soft text-danger-text",
  DISPUTED: "bg-danger-soft text-danger-text",
  REFUNDED: "bg-bg-soft text-text-secondary",
};

export const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status;

export const getOrderStatusClassName = (status) =>
  ORDER_STATUS_CLASSNAMES[status] || "bg-bg-soft text-text-secondary";
