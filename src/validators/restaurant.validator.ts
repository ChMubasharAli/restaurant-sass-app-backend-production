import { z } from "zod";

export const updateRestaurantSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isOpen: z.boolean().optional(),
  deliveryRadiusKm: z.number().positive().optional(),
  authorizeNetApiLoginId: z.string().optional(),
  authorizeNetTransactionKey: z.string().optional(),
});

export type UpdateRestaurantSettingsInput = z.infer<
  typeof updateRestaurantSettingsSchema
>;
