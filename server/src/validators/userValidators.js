const FULL_NAME_REGEX = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_BIO_LENGTH = 500;
const MAX_EXPERIENCE_ITEMS = 20;
const MAX_EXPERIENCE_ITEM_LENGTH = 200;

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

  if (payload.bio !== undefined) {
    const bio = normalizeText(payload.bio);
    if (bio.length > MAX_BIO_LENGTH) {
      errors.push({
        field: "bio",
        message: `Bio cannot exceed ${MAX_BIO_LENGTH} characters.`,
      });
    } else {
      updates.bio = bio;
    }
  }

  if (payload.experience !== undefined) {
    if (!Array.isArray(payload.experience)) {
      errors.push({
        field: "experience",
        message: "Experience must be an array of strings.",
      });
    } else if (payload.experience.length > MAX_EXPERIENCE_ITEMS) {
      errors.push({
        field: "experience",
        message: `Experience cannot have more than ${MAX_EXPERIENCE_ITEMS} entries.`,
      });
    } else {
      const experience = payload.experience
        .map(normalizeText)
        .filter((entry) => entry.length > 0);
      const hasTooLongEntry = experience.some(
        (entry) => entry.length > MAX_EXPERIENCE_ITEM_LENGTH,
      );

      if (hasTooLongEntry) {
        errors.push({
          field: "experience",
          message: `Each experience entry must be ${MAX_EXPERIENCE_ITEM_LENGTH} characters or fewer.`,
        });
      } else {
        updates.experience = experience;
      }
    }
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
