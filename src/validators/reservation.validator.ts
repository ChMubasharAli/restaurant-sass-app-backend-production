import { z } from "zod";
import { VALID_TIME_SLOTS } from "../utils/time-slots.js";
export const createReservationSchema = z.object({
  reservationDate: z.string().datetime("Invalid date format"),
  timeSlot: z.string().refine((val) => VALID_TIME_SLOTS.includes(val), {
    message:
      "Invalid time slot. Must be one of: " + VALID_TIME_SLOTS.join(", "),
  }),
  numberOfGuests: z
    .number()
    .int()
    .positive("Number of guests must be positive")
    .max(20, "Maximum 20 guests allowed"),
  customerName: z.string().min(1, "Customer name is required").max(100),
  phoneNumber: z.string().min(1, "Phone number is required").max(20),
  specialRequest: z.string().max(500).optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]),
  notes: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;
