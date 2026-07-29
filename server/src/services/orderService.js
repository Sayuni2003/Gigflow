import { ORDER_STATUSES, REVISION_LIMIT } from "../constants/orderStatuses.js";
import { USER_ROLES } from "../models/User.js";
import * as deliveryRepository from "../repositories/DeliveryRepository.js";
import * as gigRepository from "../repositories/GigRepository.js";
import * as orderRepository from "../repositories/OrderRepository.js";
import {
  capturePaymentForOrder,
  createPaymentForOrder,
  getResumableClientSecret,
  issueRefundForOrder,
  refundPaymentForOrder,
  transferPayoutForOrder,
} from "./paymentService.js";
import { ApiError } from "../utils/apiError.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const FREELANCER_TRANSITIONS = {
  [ORDER_STATUSES.PENDING_ACCEPTANCE]: [
    ORDER_STATUSES.IN_PROGRESS,
    ORDER_STATUSES.REJECTED,
  ],
  [ORDER_STATUSES.IN_PROGRESS]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.REVISION_REQUESTED]: [ORDER_STATUSES.DELIVERED],
};

const CLIENT_TRANSITIONS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: [ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PENDING_ACCEPTANCE]: [ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.DELIVERED]: [
    ORDER_STATUSES.COMPLETED,
    ORDER_STATUSES.REVISION_REQUESTED,
  ],
};

const formatOrderResponse = (order) => {
  return {
    _id: order._id,
    gigId: order.gigId,
    gigSnapshot: order.gigSnapshot,
    freelancerId: order.freelancerId,
    clientId: order.clientId,
    status: order.status,
    deliveryDeadline: order.deliveryDeadline,
    lastRevisionNote: order.lastRevisionNote,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const idToString = (idOrDoc) => (idOrDoc._id ?? idOrDoc).toString();

const isOrderParticipant = (order, userId) => {
  return (
    idToString(order.clientId) === userId ||
    idToString(order.freelancerId) === userId
  );
};

const buildDeliveryDeadline = (deliveryTime) => {
  return new Date(Date.now() + deliveryTime * DAY_IN_MS);
};

// Shared by the client-initiated /accept endpoint and the auto-complete
// job — both just need "release payout, mark COMPLETED" once a DELIVERED
// order is confirmed done, whether a human or the deadline confirmed it.
const completeOrder = async (order) => {
  await transferPayoutForOrder(order);

  return orderRepository.updateOrder(order._id, {
    status: ORDER_STATUSES.COMPLETED,
  });
};

export const createOrder = async ({ gigId, clientId }) => {
  const gig = await gigRepository.findById(gigId);

  if (!gig) {
    throw new ApiError(404, "Gig not found.");
  }

  if (gig.freelancerId.toString() === clientId) {
    throw new ApiError(403, "Clients cannot order their own gig.");
  }

  // Guard against duplicate PENDING_PAYMENT orders (e.g. a double click on
  // "Order now") — resume the existing one instead of opening a new charge.
  const existingOrder = await orderRepository.findPendingPaymentOrder({
    gigId: gig._id,
    clientId,
  });

  if (existingOrder) {
    const clientSecret = await getResumableClientSecret(existingOrder._id);
    const response = formatOrderResponse(existingOrder);
    response.payment = { clientSecret };

    return response;
  }

  const order = await orderRepository.createOrder({
    gigId: gig._id,
    gigSnapshot: {
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: gig.price,
      deliveryTime: gig.deliveryTime,
    },
    freelancerId: gig.freelancerId,
    clientId,
    status: ORDER_STATUSES.PENDING_PAYMENT,
    deliveryDeadline: null,
  });

  let paymentResult;
  try {
    paymentResult = await createPaymentForOrder(order);
  } catch (err) {
    // Don't leave an orphaned order the client can never pay for.
    await orderRepository.deleteOrder(order._id);
    throw err;
  }

  const response = formatOrderResponse(order);
  response.payment = { clientSecret: paymentResult.clientSecret };

  return response;
};

export const getOrders = async ({ userId, role }) => {
  let filter;

  if (role === USER_ROLES.CLIENT) {
    filter = { clientId: userId };
  } else if (role === USER_ROLES.FREELANCER) {
    filter = { freelancerId: userId };
  } else {
    throw new ApiError(403, "You are not authorized to access orders.");
  }

  const orders = await orderRepository.getOrdersByUser(filter);

  return orders.map(formatOrderResponse);
};

export const getSingleOrder = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!isOrderParticipant(order, userId)) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  return formatOrderResponse(order);
};

export const getOrderClientName = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderByIdWithParties(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (idToString(order.freelancerId) !== userId) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  return {
    clientId: order.clientId._id,
    fullName: order.clientId.fullName,
  };
};

export const getOrderFreelancerName = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderByIdWithParties(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (idToString(order.clientId) !== userId) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  return {
    freelancerId: order.freelancerId._id,
    fullName: order.freelancerId.fullName,
  };
};

export const getOrderDeliveries = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!isOrderParticipant(order, userId)) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  return deliveryRepository.getByOrderId(orderId);
};

export const updateOrderStatus = async ({ orderId, userId, role, status }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  let allowedTransitions;

  if (role === USER_ROLES.FREELANCER) {
    if (order.freelancerId.toString() !== userId) {
      throw new ApiError(403, "You are not authorized to update this order.");
    }
    allowedTransitions = FREELANCER_TRANSITIONS[order.status];
  } else if (role === USER_ROLES.CLIENT) {
    if (order.clientId.toString() !== userId) {
      throw new ApiError(403, "You are not authorized to update this order.");
    }
    allowedTransitions = CLIENT_TRANSITIONS[order.status];
  } else {
    throw new ApiError(403, "You are not authorized to update this order.");
  }

  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    throw new ApiError(
      409,
      `Cannot transition order from ${order.status} to ${status}.`,
    );
  }

  const updateData = { status };

  if (status === ORDER_STATUSES.IN_PROGRESS) {
    updateData.deliveryDeadline = buildDeliveryDeadline(
      order.gigSnapshot.deliveryTime,
    );
    // Thrown errors here (e.g. payment not yet AUTHORIZED) abort before
    // orderRepository.updateOrder runs, so the order is never IN_PROGRESS
    // without the client's funds captured (pending webhook confirmation).
    await capturePaymentForOrder(order);
  }

  if (status === ORDER_STATUSES.REJECTED) {
    await refundPaymentForOrder(order);
  }

  if (status === ORDER_STATUSES.CANCELLED) {
    await refundPaymentForOrder(order);
  }

  const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

  return formatOrderResponse(updatedOrder);
};

export const deliverOrder = async ({ orderId, userId, message, attachments }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.freelancerId.toString() !== userId) {
    throw new ApiError(403, "You are not authorized to deliver this order.");
  }

  const allowedTransitions = FREELANCER_TRANSITIONS[order.status];

  if (
    !allowedTransitions ||
    !allowedTransitions.includes(ORDER_STATUSES.DELIVERED)
  ) {
    throw new ApiError(
      409,
      `Cannot deliver an order while its status is ${order.status}.`,
    );
  }

  // revisionNumber is derived from how many deliveries already exist for
  // this order, not stored/incremented anywhere on Order itself.
  const revisionNumber = await deliveryRepository.countByOrderId(order._id);

  const delivery = await deliveryRepository.createDelivery({
    orderId: order._id,
    submittedBy: userId,
    message,
    attachments,
    revisionNumber,
  });

  const updatedOrder = await orderRepository.updateOrder(orderId, {
    status: ORDER_STATUSES.DELIVERED,
  });

  return { order: formatOrderResponse(updatedOrder), delivery };
};

export const requestRevision = async ({ orderId, userId, message }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.clientId.toString() !== userId) {
    throw new ApiError(
      403,
      "You are not authorized to request a revision for this order.",
    );
  }

  const allowedTransitions = CLIENT_TRANSITIONS[order.status];

  if (
    !allowedTransitions ||
    !allowedTransitions.includes(ORDER_STATUSES.REVISION_REQUESTED)
  ) {
    throw new ApiError(
      409,
      `Cannot request a revision while order status is ${order.status}.`,
    );
  }

  const deliveryCount = await deliveryRepository.countByOrderId(order._id);

  if (deliveryCount > REVISION_LIMIT) {
    throw new ApiError(409, "Revision cap reached.");
  }

  const updateData = { status: ORDER_STATUSES.REVISION_REQUESTED };

  // Single overwritten field, not an array — a running history of revision
  // notes belongs to the future messaging feature, not the order document.
  if (message) {
    updateData.lastRevisionNote = message;
  }

  const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

  return { order: formatOrderResponse(updatedOrder) };
};

export const acceptOrder = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.clientId.toString() !== userId) {
    throw new ApiError(403, "You are not authorized to accept this order.");
  }

  const allowedTransitions = CLIENT_TRANSITIONS[order.status];

  if (
    !allowedTransitions ||
    !allowedTransitions.includes(ORDER_STATUSES.COMPLETED)
  ) {
    throw new ApiError(
      409,
      `Cannot accept an order while its status is ${order.status}.`,
    );
  }

  const updatedOrder = await completeOrder(order);

  return { order: formatOrderResponse(updatedOrder) };
};

export const autoCompleteExpiredDeliveries = async () => {
  const orders = await orderRepository.findDeliveredPastDeadline();

  for (const order of orders) {
    try {
      await completeOrder(order);
    } catch (err) {
      // One order's payout guard failing (e.g. freelancer not yet
      // payout-verified) shouldn't block the rest of the batch — it'll be
      // retried on the next poll.
      console.error(
        `Auto-complete failed for order ${order._id}:`,
        err.message || err,
      );
    }
  }
};

// A freelancer who never delivers by the deadline leaves the client's money
// captured with nothing to show for it — refund it back automatically
// instead of leaving the order stuck in IN_PROGRESS forever.
export const autoRefundStalledOrders = async () => {
  const orders = await orderRepository.findInProgressPastDeadline();

  for (const order of orders) {
    try {
      await issueRefundForOrder(order);
      await orderRepository.updateOrder(order._id, {
        status: ORDER_STATUSES.CANCELLED,
      });
    } catch (err) {
      console.error(
        `Auto-refund failed for order ${order._id}:`,
        err.message || err,
      );
    }
  }
};
