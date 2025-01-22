import { differenceInDays, differenceInMonths, differenceInYears } from "date-fns";

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