import { BaseRepository } from "./base.repository.js";
import type { CreateOrderDTO, UpdateOrderStatusDTO } from "../dto/order.dto.js";

export class OrderRepository extends BaseRepository {
  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    });

    if (!lastOrder) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastOrder.orderNumber.slice(-4));
    const newNumber = String(lastNumber + 1).padStart(4, "0");
    return `${prefix}${newNumber}`;
  }

  async create(data: CreateOrderDTO, totalAmount: number) {
    try {
      const orderNumber = await this.generateOrderNumber();

      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          orderType: data.orderType as any,
          customerName: data.customerName,
          phoneNumber: data.phoneNumber,
          deliveryAddress: data.deliveryAddress ?? null,
          deliveryNotes: data.deliveryNotes ?? null,
          pickupTime: data.pickupTime ? new Date(data.pickupTime) : null,
          pickupType: (data.pickupType as any) ?? null,
          paymentMethod: data.paymentMethod as any,
          totalAmount,

          orderItems: {
            create: data.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: 0,
              totalPrice: 0,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              menuItem: {
                include: { category: true },
              },
            },
          },
        },
      });

      return order;
    } catch (error) {
      this.handleError(error, "OrderRepository.create");
    }
  }

  async findAll(filters?: any) {
    try {
      return await this.prisma.order.findMany({
        where: filters || {},
        include: {
          orderItems: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
          transaction: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      this.handleError(error, "OrderRepository.findAll");
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          transaction: true,
        },
      });
    } catch (error) {
      this.handleError(error, "OrderRepository.findById");
    }
  }

  async findByOrderNumber(orderNumber: string) {
    try {
      return await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          transaction: true,
        },
      });
    } catch (error) {
      this.handleError(error, "OrderRepository.findByOrderNumber");
    }
  }

  async updateStatus(id: number, status: UpdateOrderStatusDTO["status"]) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status: status as any },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, "OrderRepository.updateStatus");
    }
  }

  async updateOrderItemPrices(
    orderId: number,
    items: Array<{ id: number; unitPrice: number; totalPrice: number }>,
  ) {
    try {
      for (const item of items) {
        await this.prisma.orderItem.update({
          where: { id: item.id },
          data: {
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });
      }
    } catch (error) {
      this.handleError(error, "OrderRepository.updateOrderItemPrices");
    }
  }

  async getOrderStats() {
    try {
      const [totalOrders, ordersByStatus, totalSales] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.groupBy({
          by: ["status"],
          _count: true,
        }),
        this.prisma.order.aggregate({
          _sum: {
            totalAmount: true,
          },
          where: {
            paymentStatus: "PAID",
          },
        }),
      ]);

      return {
        totalOrders,
        ordersByStatus,
        totalSales: totalSales._sum.totalAmount || 0,
      };
    } catch (error) {
      this.handleError(error, "OrderRepository.getOrderStats");
    }
  }

  async updatePaymentStatus(id: number, paymentStatus: string) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { paymentStatus: paymentStatus as any },
      });
    } catch (error) {
      this.handleError(error, "OrderRepository.updatePaymentStatus");
    }
  }
}
