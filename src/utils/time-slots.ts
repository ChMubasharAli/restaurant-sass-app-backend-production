export const VALID_TIME_SLOTS = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

export const isValidTimeSlot = (timeSlot: string): boolean => {
  return VALID_TIME_SLOTS.includes(timeSlot);
};

export const getAvailableTimeSlots = (bookedSlots: string[]): string[] => {
  return VALID_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));
};
