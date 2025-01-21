import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from "date-fns";

export function formatAge(birthDate: Date): string {
  const today = new Date();

  // Calculate all time differences
  const years = differenceInYears(today, birthDate);
  const months = differenceInMonths(today, birthDate);
  const weeks = differenceInWeeks(today, birthDate);
  const days = differenceInDays(today, birthDate);

  if (days === 0) {
    return "0 days old";
  }

  if (years >= 1) {
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  }

  if (months >= 1) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }

  if (weeks >= 1) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} old`;
  }

  return `${days} ${days === 1 ? 'day' : 'days'} old`;
}