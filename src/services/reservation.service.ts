import { ReservationRepository } from "../repositories/reservation.repository.js";
import type { CreateReservationDTO } from "../dto/reservation.dto.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/errors.js";

export class ReservationService {
  private reservationRepository: ReservationRepository;

  constructor() {
    this.reservationRepository = new ReservationRepository();
  }

  async createReservation(data: CreateReservationDTO) {
    // Check if the time slot is available
    const isAvailable = await this.reservationRepository.checkAvailability(
      new Date(data.reservationDate),
      data.timeSlot,
    );

    if (!isAvailable) {
      throw new ConflictError(
        "This time slot is already reserved. Please choose another time.",
      );
    }

    // Validate reservation date is in the future
    const reservationDate = new Date(data.reservationDate);
    if (reservationDate < new Date()) {
      throw new ValidationError("Reservation date must be in the future");
    }

    return this.reservationRepository.create(data);
  }

  async getAllReservations() {
    return this.reservationRepository.findAll();
  }

  async getReservationById(id: number) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }
    return reservation;
  }

  async getReservationsByDate(date: string) {
    return this.reservationRepository.findByDate(new Date(date));
  }

  async acceptReservation(id: number) {
    const reservation = await this.getReservationById(id);

    if (reservation.status !== "PENDING") {
      throw new ValidationError("Only pending reservations can be accepted");
    }

    return this.reservationRepository.updateStatus(id, "ACCEPTED");
  }

  async rejectReservation(id: number, reason?: string) {
    const reservation = await this.getReservationById(id);

    if (reservation.status === "CANCELLED") {
      throw new ValidationError("Cannot reject a cancelled reservation");
    }

    const notes = reason || "Reservation rejected by restaurant";
    return this.reservationRepository.updateStatus(id, "REJECTED", notes);
  }

  async cancelReservation(id: number) {
    const reservation = await this.getReservationById(id);

    if (reservation.status === "ACCEPTED") {
      throw new ValidationError("Cannot cancel a completed reservation");
    }

    const reservation_date = await this.reservationRepository.updateStatus(
      id,
      "CANCELLED",
      "Cancelled - slot now available",
    );

    return reservation_date;
    // Cancelled slots become available again automatically
    // because our availability check excludes CANCELLED and REJECTED statuses
  }

  async getReservationSchedule(date?: string) {
    return this.reservationRepository.getReservationSchedule(
      date ? new Date(date) : undefined,
    );
  }

  async getReservationStats() {
    return this.reservationRepository.getReservationStats();
  }

  async checkSlotAvailability(date: string, timeSlot: string) {
    const isAvailable = await this.reservationRepository.checkAvailability(
      new Date(date),
      timeSlot,
    );

    return {
      date,
      timeSlot,
      available: isAvailable,
    };
  }
}
