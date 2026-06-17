import {
  adminSoftDeleteUser,
  changeUserPassword,
  getUserProfileById,
  listActiveUsers,
  softDeleteOwnAccount,
  updateUserProfile,
} from "../services/userService.js";
import { sendSuccess } from "../utils/sendResponse.js";

export const getUsers = async (_req, res) => {
  const users = await listActiveUsers();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Users fetched successfully.",
    data: users,
  });
};

export const getUserById = async (req, res) => {
  const user = await getUserProfileById(req.params.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "User fetched successfully.",
    data: user,
  });
};

export const patchUserById = async (req, res) => {
  const user = await updateUserProfile(req.params.userId, req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: "User updated successfully.",
    data: user,
  });
};

export const patchUserPassword = async (req, res) => {
  await changeUserPassword(req.params.userId, req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Password changed successfully.",
    data: null,
  });
};

export const deleteOwnUser = async (req, res) => {
  const user = await softDeleteOwnAccount(req.params.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "Account soft-deleted successfully.",
    data: user,
  });
};

export const adminDeleteUser = async (req, res) => {
  const user = await adminSoftDeleteUser(req.params.userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: "User soft-deleted by admin successfully.",
    data: user,
  });
};
