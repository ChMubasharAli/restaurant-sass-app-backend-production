import type { Request, Response } from "express";
import { PaymentService } from "../services/payment.service.js";
import { OrderService } from "../services/order.service.js";
import { ValidationError } from "../utils/errors.js";

export class PaymentController {
  private paymentService: PaymentService;
  private orderService: OrderService;

  constructor() {
    this.paymentService = new PaymentService();
    this.orderService = new OrderService();
  }

  /**
   * Process credit card payment
   * POST /api/payments/process
   */
  processPayment = async (req: Request, res: Response) => {
    const {
      orderId,
      cardNumber,
      expirationDate,
      cardCode,
      customerName,
      customerEmail,
      billingAddress,
      billingCity,
      billingState,
      billingZip,
    } = req.body;

    // Validate required fields
    if (!orderId || !cardNumber || !expirationDate || !cardCode) {
      throw new ValidationError("Missing required payment information");
    }

    // Get the order to verify it exists
    const order = await this.orderService.getOrderById(orderId);

    if (!order) {
      throw new ValidationError("Order not found");
    }

    // Process payment
    const result = await this.paymentService.processCreditCardPayment({
      amount: Number(order.totalAmount),
      cardNumber,
      expirationDate,
      cardCode,
      customerName: customerName || order.customerName,
      customerEmail,
      address: billingAddress,
      city: billingCity,
      state: billingState,
      zip: billingZip,
      orderId,
    });

    if (result.success) {
      // Update order payment status
      await this.orderService.updateOrderPaymentStatus(orderId, "PAID");

      res.json({
        status: "success",
        message: "Your payment has been processed successfully.",
        data: {
          orderNumber: order.orderNumber,
          transactionId: result.transactionId,
          amount: order.totalAmount,
        },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: result.message || "Payment failed",
      });
    }
  };

  /**
   * Process payment with Accept.js opaque data (PCI-compliant)
   * POST /api/payments/process-opaque
   */
  processOpaquePayment = async (req: Request, res: Response) => {
    const {
      orderId,
      opaqueDataDescriptor,
      opaqueDataValue,
      customerName,
      customerEmail,
    } = req.body;

    if (!orderId || !opaqueDataDescriptor || !opaqueDataValue) {
      throw new ValidationError("Missing required payment information");
    }

    const order = await this.orderService.getOrderById(orderId);

    if (!order) {
      throw new ValidationError("Order not found");
    }
    const result = await this.paymentService.processPaymentWithOpaqueData({
      amount: Number(order.totalAmount),
      opaqueDataDescriptor,
      opaqueDataValue,
      customerName: customerName || order.customerName,
      customerEmail,
      orderId,
    });

    if (result.success) {
      await this.orderService.updateOrderPaymentStatus(orderId, "PAID");

      res.json({
        status: "success",
        message: "Your payment has been processed successfully.",
        data: {
          orderNumber: order.orderNumber,
          transactionId: result.transactionId,
          amount: order.totalAmount,
        },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: result.message || "Payment failed",
      });
    }
  };

  /**
   * Handle Cash on Delivery orders
   * POST /api/payments/cod
   */
  processCOD = async (req: Request, res: Response) => {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    const order = await this.orderService.getOrderById(orderId);

    if (!order) {
      throw new ValidationError("Order not found");
    }

    // For COD, just update the payment status and create a transaction record
    await this.orderService.updateOrderPaymentStatus(orderId, "PENDING");

    // Create a pending transaction record for COD
    await (this.paymentService as any).transactionService.createTransaction({
      orderId,
      paymentMethod: "COD",
      amount: Number(order.totalAmount),
      status: "PENDING",
    });

    res.json({
      status: "success",
      message: "Your order has been placed successfully.",
      data: {
        orderNumber: order.orderNumber,
        paymentMethod: "COD",
        amount: order.totalAmount,
        status: "Order placed - Payment on delivery",
      },
    });
  };
}
