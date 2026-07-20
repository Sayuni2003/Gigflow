import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrderPayment,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
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

orderRouter.patch(
  "/:orderId/status",
  authenticate,
  asyncHandler(updateOrderStatus),
);

export default orderRouter;
