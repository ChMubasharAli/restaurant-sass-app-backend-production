import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const transactionController = new TransactionController();

router.get("/", asyncHandler(transactionController.getAllTransactions));
router.get(
  "/summary",
  asyncHandler(transactionController.getTransactionsSummary),
);
router.get(
  "/order/:orderId",
  asyncHandler(transactionController.getTransactionByOrderId),
);

export { router as transactionRoutes };
