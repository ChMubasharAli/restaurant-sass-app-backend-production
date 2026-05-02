import type { Request, Response } from "express";
import { RestaurantService } from "../services/restaurant.service.js";
import { updateRestaurantSettingsSchema } from "../validators/restaurant.validator.js";
import { ValidationError } from "../utils/errors.js";

export class RestaurantController {
  private restaurantService: RestaurantService;

  constructor() {
    this.restaurantService = new RestaurantService();
  }

  getSettings = async (req: Request, res: Response) => {
    const settings = await this.restaurantService.getSettings();
    res.json({
      status: "success",
      data: settings,
    });
  };

  updateSettings = async (req: Request, res: Response) => {
    const validationResult = updateRestaurantSettingsSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0]?.message);
    }

    const settings = await this.restaurantService.updateSettings(
      validationResult.data,
    );
    res.json({
      status: "success",
      data: settings,
    });
  };

  getDeliveryRadius = async (req: Request, res: Response) => {
    const radius = await this.restaurantService.getDeliveryRadius();
    res.json({
      status: "success",
      data: radius,
    });
  };
}
