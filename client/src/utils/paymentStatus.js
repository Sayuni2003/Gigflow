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

// From the freelancer's side, CAPTURED only means the client's payment is
// held in escrow - the money hasn't reached the freelancer yet, so it can't
// share the client-facing "Paid"/success-green treatment (only TRANSFERRED,
// the actual payout, should read as final/paid).
const FREELANCER_PAYMENT_STATUS_LABELS = {
  ...PAYMENT_STATUS_LABELS,
  CAPTURED: "In escrow",
  TRANSFERRED: "Paid out",
};

const FREELANCER_PAYMENT_STATUS_CLASSNAMES = {
  ...PAYMENT_STATUS_CLASSNAMES,
  CAPTURED: "bg-primary-soft text-primary",
};

export const getFreelancerPaymentStatusLabel = (status) =>
  FREELANCER_PAYMENT_STATUS_LABELS[status] || status;

export const getFreelancerPaymentStatusClassName = (status) =>
  FREELANCER_PAYMENT_STATUS_CLASSNAMES[status] || "bg-bg-soft text-text-secondary";
