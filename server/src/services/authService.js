import * as userRepository from "../repositories/UserRepository.js";
import { ApiError } from "../utils/apiError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import {
  buildTokenPayload,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validators/authValidators.js";

export const registerUser = async (payload) => {
  const { errors, value } = validateRegisterInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  const existingUser = await userRepository.findByEmail(value.email);

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.", [
      { field: "email", message: "Try a different email address." },
    ]);
  }

  const user = await userRepository.create(value);

  return sanitizeUser(user);
};

export const loginUser = async (payload) => {
  const { errors, value } = validateLoginInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  const user = await userRepository.findByEmailWithPassword(value.email);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const isPasswordValid = await user.comparePassword(value.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const sanitizedUser = sanitizeUser(user);
  const tokenPayload = buildTokenPayload(sanitizedUser);
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken,
    refreshToken,
    user: sanitizedUser,
  };
};

export const refreshAuthTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  const user = await userRepository.findAuthUserById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const sanitizedUser = sanitizeUser(user);
  const tokenPayload = buildTokenPayload(sanitizedUser);
  const accessToken = generateAccessToken(tokenPayload);
  const rotatedRefreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken,
    refreshToken: rotatedRefreshToken,
    user: sanitizedUser,
  };
};

export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Authentication required.");
  }

  return sanitizeUser(user);
};
