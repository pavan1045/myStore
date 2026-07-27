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

/**
 * Formats a date into a relative time string (e.g., "3 minutes ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return new Date(date).toLocaleDateString();
}
