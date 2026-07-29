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

export const validateUpdateRatingInput = (params = {}, payload = {}) => {
  const errors = [];
  const orderId =
    typeof params.orderId === "string" ? params.orderId.trim() : "";
  const orderIdError = validateObjectId("orderId", orderId);

  if (orderIdError) {
    errors.push(orderIdError);
  }

  const hasRating = payload.rating !== undefined;
  const hasComment = payload.comment !== undefined;

  if (!hasRating && !hasComment) {
    errors.push({
      field: "rating",
      message: "Provide a rating and/or comment to update.",
    });
  }

  let rating;

  if (hasRating) {
    rating = Number(payload.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.push({
        field: "rating",
        message: "Rating must be an integer between 1 and 5.",
      });
    }
  }

  let comment;

  if (hasComment) {
    comment =
      typeof payload.comment === "string" ? payload.comment.trim() : "";

    if (comment.length > 1000) {
      errors.push({
        field: "comment",
        message: "Comment must be at most 1000 characters.",
      });
    }
  }

  return {
    errors,
    value: { orderId, rating, comment },
  };
};

export const validateGetOrderRatingInput = (params = {}) => {
  const errors = [];
  const orderId =
    typeof params.orderId === "string" ? params.orderId.trim() : "";
  const orderIdError = validateObjectId("orderId", orderId);

  if (orderIdError) {
    errors.push(orderIdError);
  }

  return {
    errors,
    value: { orderId },
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
