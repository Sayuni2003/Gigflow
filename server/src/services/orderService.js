import { ORDER_STATUSES } from "../constants/orderStatuses.js";
import { USER_ROLES } from "../models/User.js";
import * as gigRepository from "../repositories/GigRepository.js";
import * as orderRepository from "../repositories/OrderRepository.js";
import { ApiError } from "../utils/apiError.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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
    status: ORDER_STATUSES.PENDING_ACCEPTANCE,
    deliveryDeadline: null,
  });

  return formatOrderResponse(order);
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

export const updateOrderStatus = async ({ orderId, freelancerId, status }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.freelancerId.toString() !== freelancerId) {
    throw new ApiError(403, "You are not authorized to update this order.");
  }

  if (order.status !== ORDER_STATUSES.PENDING_ACCEPTANCE) {
    throw new ApiError(
      409,
      "Order status can only be updated while pending acceptance.",
    );
  }

  const updateData = { status };

  if (status === ORDER_STATUSES.IN_PROGRESS) {
    updateData.deliveryDeadline = buildDeliveryDeadline(
      order.gigSnapshot.deliveryTime,
    );
  }

  if (status === ORDER_STATUSES.REJECTED) {
    // TODO: Refund will be handled in the Payment module.
  }

  const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

  return formatOrderResponse(updatedOrder);
};
