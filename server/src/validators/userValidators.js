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

export const validateProfileUpdateInput = (payload) => {
  const errors = [];
  const updates = {};

  if (payload.fullName !== undefined) {
    const fullName = normalizeText(payload.fullName);
    if (!fullName) {
      errors.push({ field: "fullName", message: "Full name cannot be empty." });
    } else if (!FULL_NAME_REGEX.test(fullName)) {
      errors.push({
        field: "fullName",
        message: "Full name format is invalid.",
      });
    } else {
      updates.fullName = fullName;
    }
  }

  if (payload.dateOfBirth !== undefined) {
    const dateOfBirth = normalizeText(payload.dateOfBirth);
    if (!dateOfBirth || !isPastDate(dateOfBirth)) {
      errors.push({
        field: "dateOfBirth",
        message: "Date of birth must be a valid date in the past.",
      });
    } else {
      updates.dateOfBirth = dateOfBirth;
    }
  }

  if (Object.keys(updates).length === 0) {
    errors.push({
      field: "body",
      message:
        "Provide at least one valid field to update (fullName, dateOfBirth).",
    });
  }

  return { errors, updates };
};

export const validateChangePasswordInput = (payload) => {
  const currentPassword = normalizeText(payload.currentPassword);
  const newPassword = normalizeText(payload.newPassword);
  const errors = [];

  if (!currentPassword) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required.",
    });
  }

  if (!newPassword) {
    errors.push({ field: "newPassword", message: "New password is required." });
  } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: "newPassword",
      message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password must be different from current password.",
    });
  }

  return {
    errors,
    value: {
      currentPassword,
      newPassword,
    },
  };
};
