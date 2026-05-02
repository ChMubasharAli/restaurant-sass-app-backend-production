import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const orderController = new OrderController();

// Customer order creation
router.post("/", asyncHandler(orderController.createOrder));

// Admin order management
router.get("/", asyncHandler(orderController.getAllOrders));
router.get("/stats", asyncHandler(orderController.getOrderStats));
router.get(
  "/number/:orderNumber",
  asyncHandler(orderController.getOrderByNumber),
);
router.get("/:id", asyncHandler(orderController.getOrderById));
router.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));

export { router as orderRoutes };
