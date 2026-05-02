import { BaseRepository } from "./base.repository.js";

export class TransactionRepository extends BaseRepository {
  async create(data: {
    orderId: number;
    paymentMethod: string;
    amount: number;
    status: string;
    transactionId?: string;
    gatewayResponse?: any;
  }) {
    try {
      return await this.prisma.transaction.create({
        data: {
          orderId: data.orderId,
          transactionId: data.transactionId || null,
          paymentMethod: data.paymentMethod as any,
          amount: data.amount,
          status: data.status as any,
          gatewayResponse: data.gatewayResponse || null,
        },
      });
    } catch (error) {
      this.handleError(error, "TransactionRepository.create");
    }
  }

  async findAll() {
    try {
      return await this.prisma.transaction.findMany({
        include: {
          order: {
            include: {
              orderItems: {
                include: {
                  menuItem: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      this.handleError(error, "TransactionRepository.findAll");
    }
  }

  async findByOrderId(orderId: number) {
    try {
      return await this.prisma.transaction.findUnique({
        where: { orderId },
        include: {
          order: true,
        },
      });
    } catch (error) {
      this.handleError(error, "TransactionRepository.findByOrderId");
    }
  }

  async getTransactionsSummary() {
    try {
      const [transactions, summary] = await Promise.all([
        this.prisma.transaction.findMany({
          take: 50,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            order: {
              select: {
                orderNumber: true,
                customerName: true,
              },
            },
          },
        }),
        this.prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          _count: true,
          where: {
            status: "COMPLETED",
          },
        }),
      ]);

      const completedTransactions = await this.prisma.transaction.count({
        where: { status: "COMPLETED" },
      });

      const failedTransactions = await this.prisma.transaction.count({
        where: { status: "FAILED" },
      });

      return {
        transactions,
        summary: {
          totalTransactions: summary._count,
          totalAmount: summary._sum.amount || 0,
          completedTransactions,
          failedTransactions,
        },
      };
    } catch (error) {
      this.handleError(error, "TransactionRepository.getTransactionsSummary");
    }
  }
}
