import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from "date-fns";

export function formatAge(birthDate: Date): string {
  const today = new Date();

  // Calculate all time differences
  const years = differenceInYears(today, birthDate);
  const months = differenceInMonths(today, birthDate) % 12;
  const weeks = Math.floor((differenceInDays(today, birthDate) % 30) / 7);
  const days = differenceInDays(today, birthDate) % 7;

  // Special case for newborn (0 days old)
  if (differenceInDays(today, birthDate) === 0) {
    return "0 days old";
  }

  // Display years if available
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  }

  // Display months if available
  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }

  // Display weeks if available
  if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} old`;
  }

  // Otherwise display days
  return `${days} ${days === 1 ? 'day' : 'days'} old`;
}