import type { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service.js";

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  getAllTransactions = async (req: Request, res: Response) => {
    const transactions = await this.transactionService.getAllTransactions();
    res.json({
      status: "success",
      data: transactions,
    });
  };

  getTransactionByOrderId = async (req: Request, res: Response) => {
    const orderId = Number(req.params.orderId);
    const transaction =
      await this.transactionService.getTransactionByOrderId(orderId);
    res.json({
      status: "success",
      data: transaction,
    });
  };

  getTransactionsSummary = async (req: Request, res: Response) => {
    const summary = await this.transactionService.getTransactionsSummary();
    res.json({
      status: "success",
      data: summary,
    });
  };
}
