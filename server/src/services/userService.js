import * as userRepository from "../repositories/UserRepository.js";
import { ApiError } from "../utils/apiError.js";
import { isValidObjectId } from "../utils/objectId.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { uploadFile, deleteImage } from "./storageService.js";
import {
  validateChangePasswordInput,
  validateProfileUpdateInput,
} from "../validators/userValidators.js";

const assertValidUserId = (userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id.", [
      { field: "userId", message: "Provide a valid MongoDB ObjectId." },
    ]);
  }
};

export const listActiveUsers = async () => {
  const users = await userRepository.findAll();
  return users.map((user) => sanitizeUser(user));
};

export const getUserProfileById = async (userId) => {
  assertValidUserId(userId);

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};

export const updateUserProfile = async (userId, payload, file) => {
  assertValidUserId(userId);

  const { errors, updates } = validateProfileUpdateInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  const removeProfilePicture =
    payload.removeProfilePicture === true ||
    payload.removeProfilePicture === "true";

  if (file && removeProfilePicture) {
    throw new ApiError(400, "Validation failed.", [
      {
        field: "profilePicture",
        message:
          "Cannot upload and remove a profile picture in the same request.",
      },
    ]);
  }

  if (file || removeProfilePicture) {
    const currentUser = await userRepository.findById(userId);

    if (!currentUser) {
      throw new ApiError(404, "User not found.");
    }

    if (currentUser.profilePictureUrl) {
      await deleteImage(currentUser.profilePictureUrl);
    }

    updates.profilePictureUrl = file
      ? (await uploadFile(file, "profile-pictures")).url
      : null;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Validation failed.", [
      {
        field: "body",
        message: "Provide at least one valid field to update.",
      },
    ]);
  }

  const user = await userRepository.updateById(userId, updates);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};

export const changeUserPassword = async (userId, payload) => {
  assertValidUserId(userId);

  const { errors, value } = validateChangePasswordInput(payload);

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentPasswordValid = await user.comparePassword(
    value.currentPassword,
  );

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = value.newPassword;
  await userRepository.save(user);
};

export const softDeleteOwnAccount = async (userId) => {
  assertValidUserId(userId);

  const user = await userRepository.softDeleteById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};

export const adminSoftDeleteUser = async (userId) => {
  assertValidUserId(userId);

  const user = await userRepository.softDeleteById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};
