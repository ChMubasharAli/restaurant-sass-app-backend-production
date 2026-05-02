import { OrderRepository } from "../repositories/order.repository.js";
import { ReservationRepository } from "../repositories/reservation.repository.js";
import { RestaurantRepository } from "../repositories/restaurant.repository.js";

export class DashboardService {
  private orderRepository: OrderRepository;
  private reservationRepository: ReservationRepository;
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.reservationRepository = new ReservationRepository();
    this.restaurantRepository = new RestaurantRepository();
  }

  async getDashboardStats() {
    try {
      const [orderStats, reservationStats, restaurantSettings] =
        await Promise.all([
          this.orderRepository.getOrderStats(),
          this.reservationRepository.getReservationStats(),
          this.restaurantRepository.getSettings(),
        ]);

      // Get today's orders
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayOrders = await (
        this.orderRepository as any
      ).prisma.order.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      // Get today's revenue
      const todayRevenue = await (
        this.orderRepository as any
      ).prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          paymentStatus: "PAID",
        },
      });

      // Get recent orders (last 10)
      const recentOrders = await (
        this.orderRepository as any
      ).prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          orderType: true,
          paymentMethod: true,
          createdAt: true,
        },
      });

      // Get orders by type
      const ordersByType = await (
        this.orderRepository as any
      ).prisma.order.groupBy({
        by: ["orderType"],
        _count: true,
      });

      // Get payment method distribution
      const paymentsByMethod = await (
        this.orderRepository as any
      ).prisma.order.groupBy({
        by: ["paymentMethod"],
        _count: true,
        _sum: {
          totalAmount: true,
        },
      });

      // Get recent reservations (last 10)
      const recentReservations = await (
        this.reservationRepository as any
      ).prisma.reservation.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          customerName: true,
          reservationDate: true,
          timeSlot: true,
          numberOfGuests: true,
          status: true,
          createdAt: true,
        },
      });

      // Get today's reservations
      const todayReservations = await (
        this.reservationRepository as any
      ).prisma.reservation.count({
        where: {
          reservationDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      return {
        overview: {
          totalOrders: orderStats.totalOrders,
          todayOrders,
          totalReservations: reservationStats.totalReservations,
          todayReservations,
          totalSales: orderStats.totalSales || 0,
          todayRevenue: todayRevenue._sum.totalAmount || 0,
          restaurantStatus: restaurantSettings?.isOpen ? "Open" : "Closed",
          deliveryRadius: restaurantSettings?.deliveryRadiusKm || 5,
        },
        ordersByStatus: orderStats.ordersByStatus,
        ordersByType: ordersByType.map((item: any) => ({
          type: item.orderType,
          count: item._count,
        })),
        paymentsByMethod: paymentsByMethod.map((item: any) => ({
          method: item.paymentMethod,
          count: item._count,
          totalAmount: item._sum.totalAmount,
        })),
        reservationStats: reservationStats.byStatus,
        recentOrders,
        recentReservations,
      };
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    try {
      const where: any = {
        paymentStatus: "PAID",
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const salesData = await (
        this.orderRepository as any
      ).prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentMethod: true,
          createdAt: true,
          orderType: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalSales = salesData.reduce(
        (sum: number, order: any) => sum + Number(order.totalAmount),
        0,
      );

      return {
        totalTransactions: salesData.length,
        totalSales,
        averageOrderValue:
          salesData.length > 0 ? totalSales / salesData.length : 0,
        sales: salesData,
      };
    } catch (error) {
      console.error("Error in getSalesReport:", error);
      throw error;
    }
  }

  async getOrderAnalytics(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const orders = await (this.orderRepository as any).prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
          status: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Group by date
      const dailyStats: any = {};
      orders.forEach((order: any) => {
        const dateKey = order.createdAt.toISOString().split("T")[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            date: dateKey,
            orderCount: 0,
            totalAmount: 0,
            completed: 0,
            pending: 0,
            preparing: 0,
            ready: 0,
          };
        }
        dailyStats[dateKey].orderCount++;
        dailyStats[dateKey].totalAmount += Number(order.totalAmount);
        dailyStats[dateKey][order.status.toLowerCase()]++;
      });

      return Object.values(dailyStats);
    } catch (error) {
      console.error("Error in getOrderAnalytics:", error);
      throw error;
    }
  }
}
