export interface CreateReservationDTO {
  reservationDate: string;
  timeSlot: string;
  numberOfGuests: number;
  customerName: string;
  phoneNumber: string;
  specialRequest?: string;
}

export interface UpdateReservationStatusDTO {
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  notes?: string;
}
