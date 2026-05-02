import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const reservationController = new ReservationController();

// Customer routes
router.post("/", asyncHandler(reservationController.createReservation));
router.get(
  "/availability",
  asyncHandler(reservationController.checkAvailability),
);

// Admin routes
router.get("/", asyncHandler(reservationController.getAllReservations));
router.get("/stats", asyncHandler(reservationController.getReservationStats));
router.get(
  "/schedule",
  asyncHandler(reservationController.getReservationSchedule),
);
router.get("/time-slots", asyncHandler(reservationController.getTimeSlots));
router.get("/:id", asyncHandler(reservationController.getReservationById));
router.patch(
  "/:id/accept",
  asyncHandler(reservationController.acceptReservation),
);
router.patch(
  "/:id/reject",
  asyncHandler(reservationController.rejectReservation),
);
router.patch(
  "/:id/cancel",
  asyncHandler(reservationController.cancelReservation),
);

export { router as reservationRoutes };
