import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from "date-fns";

export function formatAge(birthDate: Date): string {
  const today = new Date();
  const years = differenceInYears(today, birthDate);
  
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  const months = differenceInMonths(today, birthDate);
  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  const weeks = differenceInWeeks(today, birthDate);
  if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  
  const days = differenceInDays(today, birthDate);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
