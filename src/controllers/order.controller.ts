import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import { DistanceService } from "../services/distance.service.js";
import { RestaurantService } from "../services/restaurant.service.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";
import { ValidationError } from "../utils/errors.js";

export class OrderController {
  private orderService: OrderService;
  private distanceService: DistanceService;
  private restaurantService: RestaurantService;

  constructor() {
    this.orderService = new OrderService();
    this.distanceService = new DistanceService();
    this.restaurantService = new RestaurantService();
  }

  createOrder = async (req: Request, res: Response) => {
    const validationResult = createOrderSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Validation failed",
      );
    }

    const orderData = validationResult.data;

    // If delivery order, validate delivery radius
    if (orderData.orderType === "DELIVERY") {
      if (!orderData.deliveryAddress) {
        throw new ValidationError(
          "Delivery address is required for delivery orders",
        );
      }

      // Get FULL restaurant settings from database
      const settings = await this.restaurantService.getSettings();

      // Customer coordinates from request body
      const customerCoordinates = {
        latitude: (req.body as any).deliveryLatitude || 0,
        longitude: (req.body as any).deliveryLongitude || 0,
      };

      console.log("📍 OrderController - createOrder (Delivery):");
      console.log(
        "  Restaurant (DB):",
        settings.latitude,
        ",",
        settings.longitude,
      );
      console.log(
        "  Customer:",
        customerCoordinates.latitude,
        ",",
        customerCoordinates.longitude,
      );

      // Validate delivery radius with restaurant coordinates from database
      const validation = await this.distanceService.validateDeliveryRadius(
        customerCoordinates,
        settings.deliveryRadiusKm,
        {
          latitude: settings.latitude,
          longitude: settings.longitude,
        },
      );

      if (!validation.isValid) {
        return res.status(400).json({
          status: "error",
          message: `We do not deliver to this location. Distance: ${validation.distance}km exceeds maximum delivery radius of ${validation.maxRadius}km.`,
        });
      }
    }

    // Create the order
    const order = await this.orderService.createOrder(orderData);
    console.log("✅ Order Created:", order?.orderNumber);

    res.status(201).json({
      status: "success",
      message: "Your order has been placed successfully.",
      data: {
        id: order?.id,
        orderNumber: order?.orderNumber,
        orderSummary: {
          items: order?.orderItems?.map((item) => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.totalPrice,
          })),
          totalAmount: order?.totalAmount,
          orderType: order?.orderType,
          paymentMethod: order?.paymentMethod,
        },
      },
    });
  };

  getAllOrders = async (req: Request, res: Response) => {
    const { status, orderType, paymentMethod, startDate, endDate } = req.query;

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (orderType) {
      filters.orderType = orderType;
    }

    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        filters.createdAt.lte = new Date(endDate as string);
      }
    }

    const orders = await this.orderService.getAllOrders(filters);
    res.json({
      status: "success",
      data: orders,
    });
  };

  getOrderById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const order = await this.orderService.getOrderById(id);
    res.json({
      status: "success",
      data: order,
    });
  };

  getOrderByNumber = async (req: Request, res: Response) => {
    const { orderNumber } = req.params;
    const order = await this.orderService.getOrderByNumber(orderNumber as any);
    res.json({
      status: "success",
      data: order,
    });
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const validationResult = updateOrderStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Validation failed",
      );
    }

    const order = await this.orderService.updateOrderStatus(
      id,
      validationResult.data.status,
    );
    res.json({
      status: "success",
      message: `Order status updated to ${validationResult.data.status}`,
      data: order,
    });
  };

  getOrderStats = async (req: Request, res: Response) => {
    const stats = await this.orderService.getOrderStats();
    res.json({
      status: "success",
      data: stats,
    });
  };

  cancelOrder = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const order = await this.orderService.cancelOrder(id);
    res.json({
      status: "success",
      message: "Order cancelled successfully",
      data: order,
    });
  };
}
