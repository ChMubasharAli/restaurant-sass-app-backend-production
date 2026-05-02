import { TransactionRepository } from "../repositories/transaction.repository.js";

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async getAllTransactions() {
    return this.transactionRepository.findAll();
  }

  async getTransactionByOrderId(orderId: number) {
    return this.transactionRepository.findByOrderId(orderId);
  }

  async getTransactionsSummary() {
    return this.transactionRepository.getTransactionsSummary();
  }

  async createTransaction(data: {
    orderId: number;
    paymentMethod: string;
    amount: number;
    status: string;
    transactionId?: string;
    gatewayResponse?: any;
  }) {
    return this.transactionRepository.create(data);
  }
}
