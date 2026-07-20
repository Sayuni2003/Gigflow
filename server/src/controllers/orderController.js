import {
  createOrder as createOrderService,
  getOrders as getOrdersService,
  getSingleOrder,
  updateOrderStatus as updateOrderStatusService,
} from "../services/orderService.js";
import { getPaymentForOrder } from "../services/paymentService.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/sendResponse.js";
import {
  validateCreateOrderInput,
  validateGetOrderByIdInput,
  validateUpdateOrderStatusInput,
} from "../validators/orderValidators.js";

const assertValidInput = ({ errors, value }) => {
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed.", errors);
  }

  return value;
};

export const createOrder = async (req, res) => {
  const { gigId } = assertValidInput(validateCreateOrderInput(req.body));

  const order = await createOrderService({
    gigId,
    clientId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Order created successfully.",
    data: order,
  });
};

export const getOrders = async (req, res) => {
  const orders = await getOrdersService({
    userId: req.user.userId,
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Orders fetched successfully.",
    data: orders,
  });
};

export const getOrderById = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const order = await getSingleOrder({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Order fetched successfully.",
    data: order,
  });
};

export const getOrderPayment = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const payment = await getPaymentForOrder({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payment status fetched successfully.",
    data: payment,
  });
};

export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = assertValidInput(
    validateUpdateOrderStatusInput(req.params, req.body),
  );

  const order = await updateOrderStatusService({
    orderId,
    userId: req.user.userId,
    role: req.user.role,
    status,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Order status updated successfully.",
    data: order,
  });
};
