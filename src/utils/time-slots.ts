import prisma from "../config/database.js";

/**
 * Generate 1-hour time slots between opening and closing time
 * Example: openingTime="11:00", closingTime="22:00"
 * Output: ["11:00", "12:00", "13:00", ..., "21:00"]
 * Note: Last slot is 1 hour before closing time
 */
export async function generateTimeSlots(): Promise<string[]> {
  // Get restaurant settings for opening/closing times
  const settings = await prisma.restaurantSettings.findFirst();

  const openingTime = settings?.openingTime || "11:00";
  const closingTime = settings?.closingTime || "22:00";

  const slots: string[] = [];

  const openParts = openingTime.split(":").map(Number);
  const closeParts = closingTime.split(":").map(Number);

  const openHour = openParts[0] ?? 11;
  const openMinute = openParts[1] ?? 0;
  const closeHour = closeParts[0] ?? 22;
  const closeMinute = closeParts[1] ?? 0;

  let currentHour = openHour;
  let currentMinute = openMinute;

  // Generate slots until closing time
  // Last slot should be at least 1 hour before closing
  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    // Skip if adding 1 hour would reach or exceed closing time
    const nextHour = currentHour + 1;
    if (
      nextHour > closeHour ||
      (nextHour === closeHour && currentMinute > closeMinute) ||
      (nextHour === closeHour && closeMinute === 0 && currentMinute === 0)
    ) {
      break;
    }

    const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
    slots.push(timeString);

    // Move to next hour
    currentHour += 1;
  }

  return slots;
}

/**
 * Get all valid time slots dynamically from restaurant settings
 */
export async function getValidTimeSlots(): Promise<string[]> {
  return generateTimeSlots();
}

/**
 * Check if a time slot is valid based on current restaurant settings
 */
export async function isValidTimeSlot(timeSlot: string): Promise<boolean> {
  const validSlots = await generateTimeSlots();
  return validSlots.includes(timeSlot);
}

/**
 * Get available time slots for a specific date
 * Filters out already booked slots
 */
export async function getAvailableTimeSlots(
  bookedSlots: string[],
): Promise<string[]> {
  const allSlots = await generateTimeSlots();
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

// Keep static export for backward compatibility
export const VALID_TIME_SLOTS: string[] = [];
