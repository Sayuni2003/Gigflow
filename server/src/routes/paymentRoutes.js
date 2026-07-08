import { Router } from "express";
import { onboardFreelancerController } from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { USER_ROLES } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const paymentRouter = Router();

paymentRouter.post(
  "/onboard-freelancer",
  authenticate,
  authorize(USER_ROLES.FREELANCER),
  asyncHandler(onboardFreelancerController),
);

export default paymentRouter;
