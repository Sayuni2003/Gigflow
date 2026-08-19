import {
  acceptOrder as acceptOrderService,
  createOrder as createOrderService,
  deliverOrder as deliverOrderService,
  getOrderClientName,
  getOrderDeliveries as getOrderDeliveriesService,
  getOrderFreelancerName,
  getOrders as getOrdersService,
  getSingleOrder,
  requestRevision as requestRevisionService,
  updateOrderStatus as updateOrderStatusService,
} from "../services/orderService.js";
import { getPaymentForOrder } from "../services/paymentService.js";
import { uploadFile } from "../services/storageService.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/sendResponse.js";
import {
  validateCreateOrderInput,
  validateDeliverOrderInput,
  validateGetOrderByIdInput,
  validateRequestRevisionInput,
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
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Order fetched successfully.",
    data: order,
  });
};

export const getOrderClient = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const client = await getOrderClientName({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Client fetched successfully.",
    data: client,
  });
};

export const getOrderFreelancer = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const freelancer = await getOrderFreelancerName({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Freelancer fetched successfully.",
    data: freelancer,
  });
};

export const getOrderPayment = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const payment = await getPaymentForOrder({
    orderId,
    userId: req.user.userId,
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Payment status fetched successfully.",
    data: payment,
  });
};

export const getOrderDeliveries = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const deliveries = await getOrderDeliveriesService({
    orderId,
    userId: req.user.userId,
    role: req.user.role,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Deliveries fetched successfully.",
    data: deliveries,
  });
};

export const deliverOrder = async (req, res) => {
  const { orderId, message, attachments: linkAttachments } = assertValidInput(
    validateDeliverOrderInput(req.params, req.body),
  );

  const files = req.files || [];
  const uploadedAttachments = await Promise.all(
    files.map((file) => uploadFile(file, "deliveries")),
  );

  const result = await deliverOrderService({
    orderId,
    userId: req.user.userId,
    message,
    attachments: [...uploadedAttachments, ...linkAttachments],
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Order delivered successfully.",
    data: result,
  });
};

export const requestRevision = async (req, res) => {
  const { orderId, message } = assertValidInput(
    validateRequestRevisionInput(req.params, req.body),
  );

  const result = await requestRevisionService({
    orderId,
    userId: req.user.userId,
    message,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Revision requested successfully.",
    data: result,
  });
};

export const acceptOrder = async (req, res) => {
  const { orderId } = assertValidInput(validateGetOrderByIdInput(req.params));

  const result = await acceptOrderService({
    orderId,
    userId: req.user.userId,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Order accepted successfully.",
    data: result,
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
