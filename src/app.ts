import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsConfig } from "./config/cors.config.js";
import { mainRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timeStamp: new Date().toISOString() });
});

// API Routes
app.use("/api", mainRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

export { app };
