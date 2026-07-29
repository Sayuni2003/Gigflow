import client from "./client";
import { DISPUTE_ENDPOINTS } from "../config/endpoints";

export const getDisputes = (status) => {
  return client.get(DISPUTE_ENDPOINTS.base, {
    params: status ? { status } : undefined,
  });
};

export const getDisputeById = (disputeId) => {
  return client.get(DISPUTE_ENDPOINTS.byId(disputeId));
};

export const resolveDispute = (disputeId, { decision, resolutionNote }) => {
  return client.patch(DISPUTE_ENDPOINTS.resolve(disputeId), {
    decision,
    resolutionNote,
  });
};
