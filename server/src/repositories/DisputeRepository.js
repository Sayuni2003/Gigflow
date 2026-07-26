import Dispute from "../models/Dispute.js";

export const createDispute = (disputeData) => {
  return Dispute.create(disputeData);
};

export const getDisputeById = (disputeId) => {
  return Dispute.findById(disputeId);
};

export const getDisputes = (filter = {}) => {
  return Dispute.find(filter).sort({ createdAt: -1 });
};

export const updateDispute = (disputeId, updateData) => {
  return Dispute.findByIdAndUpdate(
    disputeId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};
