import env from "./env.js";
import { parseDurationToMs } from "../utils/time.js";

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const accessTokenMaxAge = parseDurationToMs(env.JWT_ACCESS_EXPIRY);
const refreshTokenMaxAge = parseDurationToMs(env.JWT_REFRESH_EXPIRY);

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: env.NODE_ENV === "production",
};

export const getAccessTokenCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: accessTokenMaxAge,
});

export const getRefreshTokenCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: refreshTokenMaxAge,
});

export const getClearTokenCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: 0,
});
