import type { UpdateRestaurantSettingsInput } from "../validators/restaurant.validator.js";
import { RestaurantRepository } from "../repositories/restaurant.repository.js";

import { NotFoundError } from "../utils/errors.js";

export class RestaurantService {
  private restaurantRepository: RestaurantRepository;

  constructor() {
    this.restaurantRepository = new RestaurantRepository();
  }

  async getSettings() {
    const settings = await this.restaurantRepository.getSettings();
    if (!settings) {
      throw new NotFoundError("Restaurant settings not found");
    }
    return settings;
  }

  async updateSettings(data: UpdateRestaurantSettingsInput) {
    const settings = await this.restaurantRepository.getSettings();
    if (!settings) {
      throw new NotFoundError("Restaurant settings not found");
    }
    return this.restaurantRepository.updateSettings(settings.id, data);
  }

  async getDeliveryRadius() {
    const radius = await this.restaurantRepository.getDeliveryRadius();
    if (!radius) {
      throw new NotFoundError("Restaurant settings not found");
    }
    return radius;
  }
}
