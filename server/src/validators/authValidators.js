import { USER_ROLES } from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_REGEX = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
const MIN_PASSWORD_LENGTH = 8;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const isPastDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
};

export const validateRegisterInput = (payload) => {
  const fullName = normalizeText(payload.fullName);
  const email = normalizeText(payload.email).toLowerCase();
  const password = normalizeText(payload.password);
  const role = normalizeText(payload.role || USER_ROLES.CLIENT).toUpperCase();
  const dateOfBirth = normalizeText(payload.dateOfBirth);

  const errors = [];

  if (!fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  } else if (!FULL_NAME_REGEX.test(fullName)) {
    errors.push({ field: "fullName", message: "Full name format is invalid." });
  }

  if (!email) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "Email format is invalid." });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: "password",
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  if (!dateOfBirth) {
    errors.push({
      field: "dateOfBirth",
      message: "Date of birth is required.",
    });
  } else if (!isPastDate(dateOfBirth)) {
    errors.push({
      field: "dateOfBirth",
      message: "Date of birth must be a valid date in the past.",
    });
  }

  if (role === USER_ROLES.ADMIN) {
    errors.push({
      field: "role",
      message: "Public registration cannot create ADMIN accounts.",
    });
  }

  if (![USER_ROLES.CLIENT, USER_ROLES.FREELANCER].includes(role)) {
    errors.push({
      field: "role",
      message: "Role must be CLIENT or FREELANCER for public registration.",
    });
  }

  return {
    errors,
    value: {
      fullName,
      email,
      password,
      role,
      dateOfBirth,
    },
  };
};

export const validateLoginInput = (payload) => {
  const email = normalizeText(payload.email).toLowerCase();
  const password = normalizeText(payload.password);
  const errors = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required." });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  return {
    errors,
    value: {
      email,
      password,
    },
  };
};
