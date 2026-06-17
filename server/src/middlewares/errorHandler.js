import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const buildValidationError = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return new ApiError(400, "Validation failed.", errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, "Invalid value provided.", [
      { field: error.path, message: `Invalid value for ${error.path}.` },
    ]);
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
    return new ApiError(409, "Duplicate value error.", [
      { field: duplicateField, message: `${duplicateField} already exists.` },
    ]);
  }

  return null;
};

export const errorHandler = (error, _req, res, _next) => {
  const normalizedError = buildValidationError(error) || error;
  const statusCode = normalizedError.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: normalizedError.message || "Internal server error.",
    data: null,
    errors: normalizedError.errors || null,
  });
};
