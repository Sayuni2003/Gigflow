import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearTokenCookieOptions,
} from "../config/cookie.js";
import {
  loginUser,
  refreshAuthTokens,
  registerUser,
  getMe,
} from "../services/authService.js";
import { sendSuccess } from "../utils/sendResponse.js";

export const register = async (req, res) => {
  const user = await registerUser(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful.",
    data: user,
  });
};

export const login = async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUser(req.body);

  res.cookie(
    ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    getAccessTokenCookieOptions(),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Login successful.",
    data: user,
  });
};

export const refresh = async (req, res) => {
  const { accessToken, refreshToken, user } = await refreshAuthTokens(
    req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
  );

  res.cookie(
    ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    getAccessTokenCookieOptions(),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Token refreshed successfully.",
    data: user,
  });
};

export const me = async (req, res) => {
  const user = await getMe(req.user.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Current user fetched successfully.",
    data: user,
  });
};

export const logout = async (_req, res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, getClearTokenCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getClearTokenCookieOptions());

  return sendSuccess(res, {
    statusCode: 200,
    message: "Logout successful.",
    data: null,
  });
};
