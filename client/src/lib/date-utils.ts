import { differenceInDays, differenceInMonths, differenceInYears, format } from "date-fns";

// Format date for display in a consistent format across the application
export function formatDisplayDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

// Format date for form inputs
export function formatInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format date for API/Database (UTC noon to prevent timezone issues)
export function formatApiDate(date: Date): string {
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12, 0, 0
  ));
  return utcDate.toISOString();
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