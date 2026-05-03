export interface UpdateRestaurantSettingsDTO {
  name?: string;
  contactNumber?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isOpen?: boolean;
  deliveryRadiusKm?: number;
  authorizeNetApiLoginId?: string;
  authorizeNetTransactionKey?: string;
  openingTime?: string;
  closingTime?: string;
  logoUrl?: string;
}
