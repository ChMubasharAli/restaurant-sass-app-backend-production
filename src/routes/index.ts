import { Router } from "express";
import { restaurantRoutes } from "./restaurant.routes.js";
import { categoryRoutes } from "./category.routes.js";
import { menuItemRoutes } from "./menu-item.routes.js";
import { orderRoutes } from "./order.routes.js";
import { reservationRoutes } from "./reservation.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { transactionRoutes } from "./transaction.routes.js";
import { paymentRoutes } from "./payment.routes.js";
import { adminRoutes } from "./admin.routes.js";

const router = Router();

router.use("/restaurant", restaurantRoutes);
router.use("/categories", categoryRoutes);
router.use("/menu-items", menuItemRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/transactions", transactionRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export { router as mainRouter };
