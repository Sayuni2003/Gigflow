import { Router } from "express";
import {
  acceptOrder,
  createOrder,
  deliverOrder,
  getOrderById,
  getOrderClient,
  getOrderFreelancer,
  getOrderPayment,
  getOrders,
  requestRevision,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { raiseDispute } from "../controllers/disputeController.js";
import {
  createRating,
  deleteRating,
  getOrderRating,
  updateRating,
} from "../controllers/ratingController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadAttachments } from "../middlewares/upload.js";
import { USER_ROLES } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const orderRouter = Router();

orderRouter.post(
  "/",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(createOrder),
);

orderRouter.get("/", authenticate, asyncHandler(getOrders));

orderRouter.get("/:orderId", authenticate, asyncHandler(getOrderById));

orderRouter.get(
  "/:orderId/payment",
  authenticate,
  asyncHandler(getOrderPayment),
);

orderRouter.get(
  "/:orderId/client",
  authenticate,
  authorize(USER_ROLES.FREELANCER),
  asyncHandler(getOrderClient),
);

orderRouter.get(
  "/:orderId/freelancer",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(getOrderFreelancer),
);

orderRouter.patch(
  "/:orderId/status",
  authenticate,
  asyncHandler(updateOrderStatus),
);

orderRouter.post(
  "/:orderId/deliver",
  authenticate,
  authorize(USER_ROLES.FREELANCER),
  uploadAttachments.array("files", 5),
  asyncHandler(deliverOrder),
);

orderRouter.post(
  "/:orderId/request-revision",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(requestRevision),
);

orderRouter.post(
  "/:orderId/accept",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(acceptOrder),
);

orderRouter.post(
  "/:orderId/disputes",
  authenticate,
  authorize(USER_ROLES.CLIENT, USER_ROLES.FREELANCER),
  uploadAttachments.array("files", 5),
  asyncHandler(raiseDispute),
);

orderRouter.post(
  "/:orderId/rating",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(createRating),
);

orderRouter.get("/:orderId/rating", asyncHandler(getOrderRating));

orderRouter.patch(
  "/:orderId/rating",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(updateRating),
);

orderRouter.delete(
  "/:orderId/rating",
  authenticate,
  authorize(USER_ROLES.CLIENT),
  asyncHandler(deleteRating),
);

export default orderRouter;
