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

// Check if the current time is before Thursday at noon Eastern
export function isBeforeThursdayNoonEastern(): boolean {
  const now = new Date();
  
  // Convert current time to Eastern Time
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  // Find the upcoming Thursday at noon
  const upcomingThursday = getUpcomingThursdayNoon();
  
  return easternTime < upcomingThursday;
}

// Get the upcoming Thursday at noon Eastern time
export function getUpcomingThursdayNoon(): Date {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  // Find the next Thursday
  const daysUntilThursday = (4 - easternTime.getDay() + 7) % 7;
  const nextThursday = new Date(easternTime);
  
  if (daysUntilThursday === 0) {
    // If today is Thursday, check if it's before noon
    if (easternTime.getHours() < 12) {
      // Use today's Thursday at noon
      nextThursday.setHours(12, 0, 0, 0);
    } else {
      // Use next Thursday at noon
      nextThursday.setDate(easternTime.getDate() + 7);
      nextThursday.setHours(12, 0, 0, 0);
    }
  } else {
    // Use upcoming Thursday at noon
    nextThursday.setDate(easternTime.getDate() + daysUntilThursday);
    nextThursday.setHours(12, 0, 0, 0);
  }
  
  return nextThursday;
}

// Get time remaining until Thursday noon deadline
export function getTimeUntilDeadline(): string {
  const deadline = getUpcomingThursdayNoon();
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  const timeDiff = deadline.getTime() - easternTime.getTime();
  
  if (timeDiff <= 0) {
    return "Deadline passed";
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}, ${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
}

// Format the deadline for display
export function formatDeadline(): string {
  const deadline = getUpcomingThursdayNoon();
  return format(deadline, 'EEEE, MMMM d \'at\' h:mm a \'EST\'');
}