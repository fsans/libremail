import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns';

/**
 * Format a date for email display
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatEmailDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return format(dateObj, 'p'); // 12:00 PM
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d'); // Jan 1
  }
  
  return format(dateObj, 'MMM d, yyyy'); // Jan 1, 2023
}

/**
 * Format a date as relative time
 * @param date Date to format
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format a date for full display
 * @param date Date to format
 * @returns Full formatted date string
 */
export function formatFullDate(date: Date | string | number): string {
  return format(new Date(date), 'PPpp'); // Apr 29, 2023, 12:00:00 PM
}