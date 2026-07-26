import { Router } from "express";
import {
  getDisputeById,
  getDisputes,
  resolveDispute,
} from "../controllers/disputeController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { USER_ROLES } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const disputeRouter = Router();

disputeRouter.get(
  "/",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(getDisputes),
);

disputeRouter.get("/:disputeId", authenticate, asyncHandler(getDisputeById));

disputeRouter.patch(
  "/:disputeId/resolve",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(resolveDispute),
);

export default disputeRouter;
