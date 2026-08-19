import env from "./env.js";
import { parseDurationToMs } from "../utils/time.js";

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const accessTokenMaxAge = parseDurationToMs(env.JWT_ACCESS_EXPIRY);
const refreshTokenMaxAge = parseDurationToMs(env.JWT_REFRESH_EXPIRY);

// Frontend (Vercel) and backend (Railway) live on different domains in
// production, making every request cross-site - "lax" cookies would never
// be sent, so it has to be "none" (which itself requires secure: true).
const baseCookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
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
