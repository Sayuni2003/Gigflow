export const PAYMENT_STATUS_LABELS = {
  PENDING: "Pending",
  AUTHORIZED: "Authorized",
  CAPTURED: "Paid",
  TRANSFERRED: "Completed",
  REFUNDED: "Refunded",
  CANCELED: "Canceled",
};

const PAYMENT_STATUS_CLASSNAMES = {
  PENDING: "bg-warning-soft text-warning-text",
  AUTHORIZED: "bg-warning-soft text-warning-text",
  CAPTURED: "bg-success-soft text-success-text",
  TRANSFERRED: "bg-success-soft text-success-text",
  REFUNDED: "bg-bg-soft text-text-secondary",
  CANCELED: "bg-danger-soft text-danger-text",
};

export const getPaymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status;

export const getPaymentStatusClassName = (status) =>
  PAYMENT_STATUS_CLASSNAMES[status] || "bg-bg-soft text-text-secondary";
