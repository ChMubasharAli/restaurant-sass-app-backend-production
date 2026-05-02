export interface CreateOrderDTO {
  orderType: "DELIVERY" | "TAKEAWAY";
  customerName: string;
  phoneNumber: string;

  // Delivery specific
  deliveryAddress?: string;
  deliveryNotes?: string;

  // Takeaway specific
  pickupTime?: string;
  pickupType?: "ASAP" | "SCHEDULED";

  // Payment
  paymentMethod: "COD" | "ONLINE";

  // Order items
  items: OrderItemDTO[];
}

export interface OrderItemDTO {
  menuItemId: number;
  quantity: number;
}

export interface UpdateOrderStatusDTO {
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
}
