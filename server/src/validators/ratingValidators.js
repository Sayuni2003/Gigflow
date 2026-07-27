import { isValidObjectId } from "../utils/objectId.js";

const validateObjectId = (field, value) => {
  if (!isValidObjectId(value)) {
    return {
      field,
      message: "Provide a valid MongoDB ObjectId.",
    };
  }

  return null;
};

export const validateCreateRatingInput = (params = {}, payload = {}) => {
  const errors = [];
  const orderId =
    typeof params.orderId === "string" ? params.orderId.trim() : "";
  const orderIdError = validateObjectId("orderId", orderId);

  if (orderIdError) {
    errors.push(orderIdError);
  }

  const rating = Number(payload.rating);
  const comment =
    typeof payload.comment === "string" ? payload.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({
      field: "rating",
      message: "Rating must be an integer between 1 and 5.",
    });
  }

  if (comment.length > 1000) {
    errors.push({
      field: "comment",
      message: "Comment must be at most 1000 characters.",
    });
  }

  return {
    errors,
    value: { orderId, rating, comment },
  };
};

export const validateGetFreelancerRatingsInput = (params = {}) => {
  const errors = [];
  const freelancerId =
    typeof params.userId === "string" ? params.userId.trim() : "";
  const freelancerIdError = validateObjectId("freelancerId", freelancerId);

  if (freelancerIdError) {
    errors.push(freelancerIdError);
  }

  return {
    errors,
    value: { freelancerId },
  };
};
