import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL,
  database: {
    url: process.env.DATABASE_URL,
  },
  authorizeNet: {
    apiLoginId: process.env.AUTHORIZE_NET_API_LOGIN_ID,
    transactionKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY,
    environment: process.env.AUTHORIZE_NET_ENVIRONMENT || "sandbox",
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  restaurant: {
    defaultDeliveryRadiusKm:
      Number(process.env.DEFAULT_DELIVERY_RADIUS_KM) || 5,
    latitude: Number(process.env.RESTAURANT_LATITUDE) || 0,
    longitude: Number(process.env.RESTAURANT_LONGITUDE) || 0,
  },
};
