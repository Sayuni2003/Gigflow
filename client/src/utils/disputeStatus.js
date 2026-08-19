export const DISPUTE_STATUS_LABELS = {
  PENDING: "Pending review",
  REFUND_APPROVED: "Refund approved",
  REFUND_REJECTED: "Refund rejected",
};

const DISPUTE_STATUS_CLASSNAMES = {
  PENDING: "bg-warning-soft text-warning-text",
  REFUND_APPROVED: "bg-success-soft text-success-text",
  REFUND_REJECTED: "bg-danger-soft text-danger-text",
};

export const getDisputeStatusLabel = (status) => DISPUTE_STATUS_LABELS[status] || status;

export const getDisputeStatusClassName = (status) =>
  DISPUTE_STATUS_CLASSNAMES[status] || "bg-bg-soft text-text-secondary";
