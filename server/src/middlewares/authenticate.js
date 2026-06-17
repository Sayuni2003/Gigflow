import * as userRepository from "../repositories/UserRepository.js";
import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ACCESS_TOKEN_COOKIE_NAME } from "../config/cookie.js";

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

export const authenticate = async (req, _res, next) => {
  try {
    const tokenFromCookie = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    const tokenFromHeader = getBearerToken(req.headers.authorization);
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      throw new ApiError(401, "Authentication required.");
    }

    const decoded = verifyAccessToken(token);

    const user = await userRepository.findAuthUserById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "Authentication required.");
    }

    req.user = {
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (_error) {
    return next(new ApiError(401, "Authentication required."));
  }
};
