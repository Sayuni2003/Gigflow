import {
  createRating as createRatingService,
  getFreelancerRatings as getFreelancerRatingsService,
  getRatingForOrder as getRatingForOrderService,
  updateRating as updateRatingService,
} from "../services/ratingService.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/sendResponse.js";
import {
  validateCreateRatingInput,
  validateGetFreelancerRatingsInput,
  validateGetOrderRatingInput,
  validateUpdateRatingInput,
} from "../validators/ratingValidators.js";

const assertValidInput = ({ errors, value }) => {
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  return value;
};

export const createRating = async (req, res) => {
  const { orderId, rating, comment } = assertValidInput(
    validateCreateRatingInput(req.params, req.body),
  );

  const result = await createRatingService({
    orderId,
    clientId: req.user.userId,
    rating,
    comment,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Rating submitted successfully.",
    data: result,
  });
};

export const updateRating = async (req, res) => {
  const { orderId, rating, comment } = assertValidInput(
    validateUpdateRatingInput(req.params, req.body),
  );

  const result = await updateRatingService({
    orderId,
    clientId: req.user.userId,
    rating,
    comment,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Rating updated successfully.",
    data: result,
  });
};

export const getOrderRating = async (req, res) => {
  const { orderId } = assertValidInput(
    validateGetOrderRatingInput(req.params),
  );

  const result = await getRatingForOrderService({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Rating fetched successfully.",
    data: result,
  });
};

export const getFreelancerRatings = async (req, res) => {
  const { freelancerId } = assertValidInput(
    validateGetFreelancerRatingsInput(req.params),
  );

  const result = await getFreelancerRatingsService({ freelancerId });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ratings fetched successfully.",
    data: result,
  });
};
