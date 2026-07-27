import { ORDER_STATUSES } from "../constants/orderStatuses.js";
import * as orderRepository from "../repositories/OrderRepository.js";
import * as ratingRepository from "../repositories/RatingRepository.js";
import { ApiError } from "../utils/apiError.js";

// A dispute always resolves into one of these two (see disputeService.resolveDispute),
// so both count as a "final outcome" a client can leave a rating on.
const RATEABLE_STATUSES = [ORDER_STATUSES.COMPLETED, ORDER_STATUSES.REFUNDED];

const formatRatingResponse = (rating) => ({
  _id: rating._id,
  orderId: rating.orderId,
  clientId: rating.clientId,
  freelancerId: rating.freelancerId,
  rating: rating.rating,
  comment: rating.comment,
  createdAt: rating.createdAt,
});

const isOrderParticipant = (order, userId) => {
  return (
    order.clientId.toString() === userId ||
    order.freelancerId.toString() === userId
  );
};

export const createRating = async ({
  orderId,
  clientId,
  rating,
  comment,
}) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.clientId.toString() !== clientId) {
    throw new ApiError(403, "You are not authorized to rate this order.");
  }

  if (!RATEABLE_STATUSES.includes(order.status)) {
    throw new ApiError(409, "This order isn't eligible for a rating yet.");
  }

  try {
    const created = await ratingRepository.createRating({
      orderId: order._id,
      clientId,
      freelancerId: order.freelancerId,
      rating,
      comment,
    });

    return formatRatingResponse(created);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "You have already rated this order.");
    }

    throw error;
  }
};

export const getRatingForOrder = async ({ orderId, userId }) => {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!isOrderParticipant(order, userId)) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  const rating = await ratingRepository.getRatingByOrderId(orderId);

  return rating ? formatRatingResponse(rating) : null;
};

export const getFreelancerRatings = async ({ freelancerId }) => {
  const [ratings, summary] = await Promise.all([
    ratingRepository.getRatingsByFreelancer(freelancerId),
    ratingRepository.getRatingSummaryForFreelancer(freelancerId),
  ]);

  return {
    ratings: ratings.map((entry) => ({
      _id: entry._id,
      rating: entry.rating,
      comment: entry.comment,
      client: entry.clientId
        ? { _id: entry.clientId._id, fullName: entry.clientId.fullName }
        : null,
      createdAt: entry.createdAt,
    })),
    average: summary.average,
    count: summary.count,
  };
};
