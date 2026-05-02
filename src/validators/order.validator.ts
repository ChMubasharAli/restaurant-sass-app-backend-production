import { z } from "zod";

const orderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  orderType: z.enum(["DELIVERY", "TAKEAWAY"]),
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),

  // Delivery fields
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  deliveryLatitude: z.number().min(-90).max(90).optional(),
  deliveryLongitude: z.number().min(-180).max(180).optional(),

  // Takeaway fields
  pickupTime: z.string().datetime().optional(),
  pickupType: z.enum(["ASAP", "SCHEDULED"]).optional(),

  // Payment
  paymentMethod: z.enum(["COD", "ONLINE"]),

  // Items
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "COMPLETED"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
