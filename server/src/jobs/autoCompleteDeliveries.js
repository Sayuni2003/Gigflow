import {
  autoCompleteExpiredDeliveries,
  autoRefundStalledOrders,
} from "../services/orderService.js";

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export const startAutoCompleteDeliveriesJob = () => {
  setInterval(() => {
    autoCompleteExpiredDeliveries().catch((err) => {
      console.error("Auto-complete deliveries job failed:", err.message || err);
    });

    autoRefundStalledOrders().catch((err) => {
      console.error("Auto-refund stalled orders job failed:", err.message || err);
    });
  }, CHECK_INTERVAL_MS);
};
