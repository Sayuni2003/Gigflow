import { Router } from "express";
import {
  adminDeleteUser,
  deleteOwnUser,
  getUserById,
  getUsers,
  patchUserById,
  patchUserPassword,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireOwner } from "../middlewares/requireOwner.js";
import { upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFreelancerRatings } from "../controllers/ratingController.js";

const userRouter = Router();

userRouter.get(
  "/",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(getUsers),
);

userRouter.get("/:userId/ratings", asyncHandler(getFreelancerRatings));
userRouter.get(
  "/:userId",
  authenticate,
  requireOwner({ allowAdmin: true }),
  asyncHandler(getUserById),
);
userRouter.patch(
  "/:userId",
  authenticate,
  requireOwner(),
  upload.single("profilePicture"),
  asyncHandler(patchUserById),
);
userRouter.patch(
  "/:userId/change-password",
  authenticate,
  requireOwner(),
  asyncHandler(patchUserPassword),
);
userRouter.delete(
  "/:userId",
  authenticate,
  requireOwner(),
  asyncHandler(deleteOwnUser),
);
userRouter.delete(
  "/:userId/admin-delete",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(adminDeleteUser),
);

export default userRouter;
