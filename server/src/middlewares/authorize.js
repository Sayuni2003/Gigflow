import { ApiError } from "../utils/apiError.js";

export const authorize = (...roles) => {
  const normalizedRoles = roles.map((role) => String(role).toUpperCase());

  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (!normalizedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You are not authorized to access this resource."),
      );
    }

    return next();
  };
};
