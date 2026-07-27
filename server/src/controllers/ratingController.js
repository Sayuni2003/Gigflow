import {
  createRating as createRatingService,
  getFreelancerRatings as getFreelancerRatingsService,
} from "../services/ratingService.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/sendResponse.js";
import {
  validateCreateRatingInput,
  validateGetFreelancerRatingsInput,
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
