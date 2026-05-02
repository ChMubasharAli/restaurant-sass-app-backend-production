import { OrderRepository } from "../repositories/order.repository.js";
import { MenuItemRepository } from "../repositories/menu-item.repository.js";
import { RestaurantRepository } from "../repositories/restaurant.repository.js";
import type { CreateOrderDTO } from "../dto/order.dto.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import prisma from "../config/database.js";

export class OrderService {
  private orderRepository: OrderRepository;
  private menuItemRepository: MenuItemRepository;
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.menuItemRepository = new MenuItemRepository();
    this.restaurantRepository = new RestaurantRepository();
  }

  async createOrder(data: CreateOrderDTO) {
    // Validate all menu items exist and are available
    let totalAmount = 0;
    const orderItemsWithPrices: any[] = [];

    for (const item of data.items) {
      const menuItem = await this.menuItemRepository.findById(item.menuItemId);

      if (!menuItem) {
        throw new NotFoundError(
          `Menu item with ID ${item.menuItemId} not found`,
        );
      }

      if (!menuItem.isAvailable) {
        throw new ValidationError(
          `Menu item "${menuItem.name}" is currently sold out`,
        );
      }

      const unitPrice = Number(menuItem.price);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      orderItemsWithPrices.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Create order
    const order = await this.orderRepository.create(data, totalAmount);

    // Update order items with correct prices
    const updateItems = order.orderItems.map((orderItem, index) => ({
      id: orderItem.id,
      unitPrice: orderItemsWithPrices[index].unitPrice,
      totalPrice: orderItemsWithPrices[index].totalPrice,
    }));

    await this.orderRepository.updateOrderItemPrices(order.id, updateItems);

    // Return updated order
    return this.orderRepository.findById(order.id);
  }

  async getAllOrders(filters?: any) {
    return this.orderRepository.findAll(filters);
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.getOrderById(id);

    const validStatuses = [
      "PENDING",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        "Invalid order status. Must be one of: PENDING, PREPARING, READY, COMPLETED, CANCELLED",
      );
    }

    // Update order status
    const updatedOrder = await this.orderRepository.updateStatus(
      id,
      status as any,
    );

    // If order is completed and has a transaction, update transaction too
    if (status === "COMPLETED") {
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: id },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { orderId: id },
          data: {
            status: "COMPLETED",
          },
        });
      }

      // Update payment status to PAID
      await this.orderRepository.updatePaymentStatus(id, "PAID");
    }

    // If order is cancelled and has a transaction, update transaction
    if (status === "CANCELLED") {
      const transaction = await prisma.transaction.findUnique({
        where: { orderId: id },
      });

      if (transaction && transaction.status === "COMPLETED") {
        await prisma.transaction.update({
          where: { orderId: id },
          data: {
            status: "REFUNDED",
          },
        });
      } else if (transaction) {
        await prisma.transaction.update({
          where: { orderId: id },
          data: {
            status: "FAILED",
          },
        });
      }
    }

    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string) {
    const order = await this.getOrderById(id);

    const validStatuses = ["PENDING", "PAID", "FAILED"];
    if (!validStatuses.includes(paymentStatus)) {
      throw new ValidationError("Invalid payment status");
    }

    return this.orderRepository.updatePaymentStatus(id, paymentStatus);
  }

  async getOrderStats() {
    return this.orderRepository.getOrderStats();
  }

  async cancelOrder(id: number) {
    const order = await this.getOrderById(id);

    if (order.status === "COMPLETED") {
      throw new ValidationError("Cannot cancel a completed order");
    }

    if ((order.status as any) === "CANCELLED") {
      throw new ValidationError("Order is already cancelled");
    }

    // If payment was online and completed, should trigger refund (future enhancement)
    // For now, just cancel the order
    return this.orderRepository.updateStatus(id, "CANCELLED");
  }
}
