import axios from "axios";
import { config } from "../config/index.js";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export class DistanceService {
  /**
   * Calculate distance between two points using Google Maps Distance Matrix API
   * Falls back to Haversine formula if API key is not configured
   */
  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<number> {
    // If Google Maps API key is configured, use it
    if (
      config.googleMaps.apiKey &&
      config.googleMaps.apiKey !== "your_google_maps_api_key"
    ) {
      return this.calculateWithGoogleMaps(origin, destination);
    }

    // Fallback to Haversine formula for development/testing
    return this.calculateWithHaversine(origin, destination);
  }

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  private async calculateWithGoogleMaps(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<number> {
    try {
      const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
      const response = await axios.get(url, {
        params: {
          origins: `${origin.latitude},${origin.longitude}`,
          destinations: `${destination.latitude},${destination.longitude}`,
          key: config.googleMaps.apiKey,
          units: "metric",
        },
      });

      const data = response.data;

      if (data.status !== "OK" || !data.rows[0]?.elements[0]?.distance) {
        throw new Error("Unable to calculate distance");
      }

      // Convert meters to kilometers
      const distanceInKm = data.rows[0].elements[0].distance.value / 1000;
      return distanceInKm;
    } catch (error) {
      console.error("Google Maps API error:", error);
      // Fallback to Haversine if Google Maps fails
      return this.calculateWithHaversine(origin, destination);
    }
  }

  /**
   * Calculate distance using Haversine formula
   * This is a fallback method for development/testing
   */
  private calculateWithHaversine(
    origin: Coordinates,
    destination: Coordinates,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(destination.latitude - origin.latitude);
    const dLon = this.toRadians(destination.longitude - origin.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.latitude)) *
        Math.cos(this.toRadians(destination.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate if delivery address is within allowed radius
   * @param customerAddress - Customer's coordinates
   * @param deliveryRadiusKm - Max delivery radius in km
   * @param restaurantCoords - Optional restaurant coordinates (from DB)
   */
  async validateDeliveryRadius(
    customerAddress: Coordinates,
    deliveryRadiusKm?: number,
    restaurantCoords?: Coordinates,
  ): Promise<{ isValid: boolean; distance: number; maxRadius: number }> {
    // Use restaurant coordinates from parameter (DB) if provided, else fall back to config
    const restaurantLocation: Coordinates = restaurantCoords || {
      latitude: config.restaurant.latitude,
      longitude: config.restaurant.longitude,
    };

    console.log("🔍 DistanceService - validateDeliveryRadius:");
    console.log(
      "  Restaurant:",
      restaurantLocation.latitude,
      ",",
      restaurantLocation.longitude,
    );
    console.log(
      "  Customer:",
      customerAddress.latitude,
      ",",
      customerAddress.longitude,
    );

    const distance = await this.calculateDistance(
      restaurantLocation,
      customerAddress,
    );
    const maxRadius =
      deliveryRadiusKm || config.restaurant.defaultDeliveryRadiusKm;

    console.log(
      "  Distance:",
      distance,
      "km | Max:",
      maxRadius,
      "km | Valid:",
      distance <= maxRadius,
    );

    return {
      isValid: distance <= maxRadius,
      distance,
      maxRadius,
    };
  }
}
