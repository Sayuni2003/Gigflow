import { ApiError } from "../utils/apiError.js";

export const requireOwner = ({
  paramKey = "userId",
  allowAdmin = false,
} = {}) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    const ownerId = req.params[paramKey];

    if (!ownerId) {
      return next(new ApiError(400, "Owner id parameter is required."));
    }

    if (allowAdmin && req.user.role === "ADMIN") {
      return next();
    }

    if (req.user.userId !== ownerId) {
      return next(
        new ApiError(403, "You are not allowed to access this resource."),
      );
    }

    return next();
  };
};
