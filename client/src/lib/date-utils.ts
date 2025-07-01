import { differenceInDays, differenceInMonths, differenceInYears, format, parseISO } from "date-fns";

// Re-export parseISO for convenience
export { parseISO };

// Format date for display in a consistent format across the application
export function formatDisplayDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

// Format date for form inputs
export function formatInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format date for API/Database to prevent timezone issues
export function formatApiDate(dateStr: string): string {
  // Split the date string into components
  const [year, month, day] = dateStr.split('-').map(Number);

  // Create a UTC date string without time component
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse API date string to local Date object
export function parseApiDate(dateStr: string): Date {
  const date = new Date(dateStr);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function formatAge(birthDate: Date): string {
  const today = new Date();

  // Calculate all time differences
  const years = differenceInYears(today, birthDate);
  const months = differenceInMonths(today, birthDate) % 12;
  const days = differenceInDays(today, birthDate) % 30;

  // Special case for newborn (0 days old)
  if (differenceInDays(today, birthDate) === 0) {
    return "0 days old";
  }

  // Display only years if over 1 year old
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  }

  // Display only months if at least 1 month old
  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }

  // Otherwise display days
  return `${days} ${days === 1 ? 'day' : 'days'} old`;
}