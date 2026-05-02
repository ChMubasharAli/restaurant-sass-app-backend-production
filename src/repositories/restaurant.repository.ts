import type { UpdateRestaurantSettingsDTO } from "../dto/restaurant.dto.js";
import { BaseRepository } from "./base.repository.js";

export class RestaurantRepository extends BaseRepository {
  async getSettings() {
    try {
      const settings = await this.prisma.restaurantSettings.findFirst();
      return settings;
    } catch (error) {
      this.handleError(error, "RestaurantRepository.getSettings");
    }
  }

  async updateSettings(id: number, data: any) {
    try {
      const settings = await this.prisma.restaurantSettings.update({
        where: { id },
        data,
      });
      return settings;
    } catch (error) {
      this.handleError(error, "RestaurantRepository.updateSettings");
    }
  }

  async getDeliveryRadius() {
    try {
      const settings = await this.prisma.restaurantSettings.findFirst({
        select: {
          deliveryRadiusKm: true,
          latitude: true,
          longitude: true,
        },
      });
      return settings;
    } catch (error) {
      this.handleError(error, "RestaurantRepository.getDeliveryRadius");
    }
  }
}
