import { ORDER_STATUSES } from "../constants/orderStatuses.js";
import { USER_ROLES } from "../models/User.js";
import * as gigRepository from "../repositories/GigRepository.js";
import * as orderRepository from "../repositories/OrderRepository.js";
import {
  capturePaymentForOrder,
  createPaymentForOrder,
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
};

const CLIENT_TRANSITIONS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: [ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PENDING_ACCEPTANCE]: [ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.IN_PROGRESS]: [ORDER_STATUSES.COMPLETED],
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
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const isOrderParticipant = (order, userId) => {
  return (
    order.clientId.toString() === userId ||
    order.freelancerId.toString() === userId
  );
};

const buildDeliveryDeadline = (deliveryTime) => {
  return new Date(Date.now() + deliveryTime * DAY_IN_MS);
};

export const createOrder = async ({ gigId, clientId }) => {
  const gig = await gigRepository.findById(gigId);

  if (!gig) {
    throw new ApiError(404, "Gig not found.");
  }

  if (gig.freelancerId.toString() === clientId) {
    throw new ApiError(403, "Clients cannot order their own gig.");
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

  if (status === ORDER_STATUSES.COMPLETED) {
    // Thrown errors here (e.g. freelancer not payout-verified) abort before
    // orderRepository.updateOrder runs, so the order isn't marked COMPLETED
    // without a payout at least initiated.
    await transferPayoutForOrder(order);
  }

  const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

  return formatOrderResponse(updatedOrder);
};
