import { z } from "zod";
import { generateTimeSlots } from "../utils/time-slots.js";

// Use Zod's async refinement for dynamic time slot validation
export const createReservationSchema = z.object({
  reservationDate: z.string().datetime("Invalid date format"),
  timeSlot: z.string().refine(
    async (val) => {
      const validSlots = await generateTimeSlots();
      return validSlots.includes(val);
    },
    {
      message: "Invalid or unavailable time slot",
    },
  ),
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
