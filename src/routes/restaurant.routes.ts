import { Router } from "express";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const restaurantController = new RestaurantController();

router.get("/settings", asyncHandler(restaurantController.getSettings));
router.put("/settings", asyncHandler(restaurantController.updateSettings));
router.get(
  "/delivery-radius",
  asyncHandler(restaurantController.getDeliveryRadius),
);

export { router as restaurantRoutes };
