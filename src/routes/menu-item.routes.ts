import { Router } from "express";
import { MenuItemController } from "../controllers/menu-item.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const menuItemController = new MenuItemController();

router.get("/", asyncHandler(menuItemController.getAllMenuItems));
router.get("/:id", asyncHandler(menuItemController.getMenuItemById));
router.post("/", asyncHandler(menuItemController.createMenuItem));
router.put("/:id", asyncHandler(menuItemController.updateMenuItem));
router.delete("/:id", asyncHandler(menuItemController.deleteMenuItem));
router.patch(
  "/:id/toggle-availability",
  asyncHandler(menuItemController.toggleAvailability),
);

export { router as menuItemRoutes };
