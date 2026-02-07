import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Converts YYYY-MM-DD to DD-MM-YYYY
 */
export function formatDateToDisplay(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

/**
 * Converts DD-MM-YYYY to YYYY-MM-DD
 */
export function parseDateFromDisplay(displayDate) {
  if (!displayDate) return '';
  const parts = displayDate.split('-');
  if (parts.length !== 3) return displayDate; // Fallback
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}
