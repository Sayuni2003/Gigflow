import { ApiError } from "../utils/apiError.js";

export const notFoundHandler = (req, _res, next) => {
  return next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
