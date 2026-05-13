import { config } from "./index.js";

const origins = [
  "http://localhost:5173",
  "http://localhost:5174",
  config.frontendUrl,
].filter((origin): origin is string => !!origin);

export const corsConfig = {
  origin: origins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};
