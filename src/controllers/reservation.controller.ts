import type { Request, Response } from "express";
import { ReservationService } from "../services/reservation.service.js";
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from "../validators/reservation.validator.js";
import { ValidationError } from "../utils/errors.js";
import { getAvailableTimeSlots } from "../utils/time-slots.js";

export class ReservationController {
  private reservationService: ReservationService;

  constructor() {
    this.reservationService = new ReservationService();
  }

  createReservation = async (req: Request, res: Response) => {
    const validationResult = createReservationSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Validation failed",
      );
    }

    const reservation = await this.reservationService.createReservation(
      validationResult.data,
    );

    res.status(201).json({
      status: "success",
      message: "Your table has been reserved successfully.",
      data: reservation,
    });
  };

  getAllReservations = async (req: Request, res: Response) => {
    const { date } = req.query;

    let reservations;
    if (date) {
      reservations = await this.reservationService.getReservationsByDate(
        date as string,
      );
    } else {
      reservations = await this.reservationService.getAllReservations();
    }

    res.json({
      status: "success",
      data: reservations,
    });
  };

  getReservationById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const reservation = await this.reservationService.getReservationById(id);

    res.json({
      status: "success",
      data: reservation,
    });
  };

  acceptReservation = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const reservation = await this.reservationService.acceptReservation(id);

    res.json({
      status: "success",
      message: "Reservation accepted successfully",
      data: reservation,
    });
  };

  rejectReservation = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { reason } = req.body;
    const reservation = await this.reservationService.rejectReservation(
      id,
      reason,
    );

    res.json({
      status: "success",
      message: "Reservation rejected",
      data: reservation,
    });
  };

  cancelReservation = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const reservation = await this.reservationService.cancelReservation(id);

    res.json({
      status: "success",
      message: "Reservation cancelled - slot is now available",
      data: reservation,
    });
  };

  getReservationSchedule = async (req: Request, res: Response) => {
    const { date } = req.query;
    const schedule = await this.reservationService.getReservationSchedule(
      date as string,
    );

    res.json({
      status: "success",
      data: schedule,
    });
  };

  getReservationStats = async (req: Request, res: Response) => {
    const stats = await this.reservationService.getReservationStats();

    res.json({
      status: "success",
      data: stats,
    });
  };

  checkAvailability = async (req: Request, res: Response) => {
    const { date, timeSlot } = req.query;

    if (!date || !timeSlot) {
      throw new ValidationError("Date and timeSlot are required");
    }

    const availability = await this.reservationService.checkSlotAvailability(
      date as string,
      timeSlot as string,
    );

    res.json({
      status: "success",
      data: availability,
    });
  };

  getTimeSlots = async (req: Request, res: Response) => {
    const { date } = req.query;

    if (!date) {
      throw new ValidationError("Date is required");
    }

    // Get booked slots for the date
    const reservations = await this.reservationService.getReservationsByDate(
      date as string,
    );
    const bookedSlots = reservations
      .filter((r) => r.status !== "CANCELLED" && r.status !== "REJECTED")
      .map((r) => r.timeSlot);

    // Now using await since getAvailableTimeSlots is async
    const availableSlots = await getAvailableTimeSlots(bookedSlots);

    res.json({
      status: "success",
      data: {
        date,
        availableSlots,
        bookedSlots,
      },
    });
  };
}
