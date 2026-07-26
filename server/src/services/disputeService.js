import { ORDER_STATUSES } from "../constants/orderStatuses.js";
import { DISPUTE_STATUSES } from "../constants/disputeStatuses.js";
import { USER_ROLES } from "../models/User.js";
import * as disputeRepository from "../repositories/DisputeRepository.js";
import * as orderRepository from "../repositories/OrderRepository.js";
import { issueRefundForOrder } from "./paymentService.js";
import { ApiError } from "../utils/apiError.js";

const formatDisputeResponse = (dispute) => {
  return {
    _id: dispute._id,
    orderId: dispute.orderId,
    raisedBy: dispute.raisedBy,
    reason: dispute.reason,
    attachments: dispute.attachments,
    status: dispute.status,
    resolvedBy: dispute.resolvedBy,
    resolutionNote: dispute.resolutionNote,
    resolvedAt: dispute.resolvedAt,
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt,
  };
};

const isOrderParticipant = (order, userId) => {
  return (
    order.clientId.toString() === userId ||
    order.freelancerId.toString() === userId
  );
};

export const raiseDispute = async ({
  orderId,
  userId,
  reason,
  attachments,
}) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!isOrderParticipant(order, userId)) {
    throw new ApiError(
      403,
      "You are not authorized to raise a dispute for this order.",
    );
  }

  if (order.status === ORDER_STATUSES.DISPUTED) {
    throw new ApiError(409, "A dispute is already open for this order.");
  }

  const dispute = await disputeRepository.createDispute({
    orderId: order._id,
    raisedBy: userId,
    reason,
    attachments,
    statusBeforeDispute: order.status,
  });

  // Freeze the order so accept/deliver/request-revision and the
  // auto-complete/auto-refund jobs all skip it while admin reviews.
  await orderRepository.updateOrder(order._id, {
    status: ORDER_STATUSES.DISPUTED,
  });

  return formatDisputeResponse(dispute);
};

export const getDisputeById = async ({ disputeId, userId, role }) => {
  const dispute = await disputeRepository.getDisputeById(disputeId);

  if (!dispute) {
    throw new ApiError(404, "Dispute not found.");
  }

  if (role !== USER_ROLES.ADMIN) {
    const order = await orderRepository.getOrderById(dispute.orderId);

    if (!order || !isOrderParticipant(order, userId)) {
      throw new ApiError(403, "You are not authorized to view this dispute.");
    }
  }

  return formatDisputeResponse(dispute);
};

export const getDisputes = async ({ status }) => {
  const filter = status ? { status } : {};
  const disputes = await disputeRepository.getDisputes(filter);

  return disputes.map(formatDisputeResponse);
};

export const resolveDispute = async ({
  disputeId,
  adminId,
  decision,
  resolutionNote,
}) => {
  const dispute = await disputeRepository.getDisputeById(disputeId);

  if (!dispute) {
    throw new ApiError(404, "Dispute not found.");
  }

  if (dispute.status !== DISPUTE_STATUSES.PENDING) {
    throw new ApiError(409, "This dispute has already been resolved.");
  }

  const order = await orderRepository.getOrderById(dispute.orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  let nextOrderStatus;

  if (decision === DISPUTE_STATUSES.REFUND_APPROVED) {
    // Throws (e.g. payment already TRANSFERRED to the freelancer) if the
    // order is too far along to refund — that error surfaces to the admin.
    await issueRefundForOrder(order);
    nextOrderStatus = ORDER_STATUSES.REFUNDED;
  } else {
    nextOrderStatus = dispute.statusBeforeDispute;
  }

  await orderRepository.updateOrder(order._id, { status: nextOrderStatus });

  const updatedDispute = await disputeRepository.updateDispute(disputeId, {
    status: decision,
    resolvedBy: adminId,
    resolutionNote: resolutionNote || null,
    resolvedAt: new Date(),
  });

  return formatDisputeResponse(updatedDispute);
};
