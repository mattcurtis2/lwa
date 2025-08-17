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

// Parse API date string to local Date object without timezone offset
export function parseApiDate(dateStr: string): Date {
  // For date-only strings (YYYY-MM-DD), create date at local midnight to avoid timezone issues
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
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

// Get the Thursday at noon Eastern time for the current week's Saturday pickup
export function getUpcomingThursdayNoon(): Date {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  // Find this week's Thursday
  const currentDay = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilThursday = 4 - currentDay; // Thursday is day 4
  
  const thisWeekThursday = new Date(easternTime);
  thisWeekThursday.setDate(easternTime.getDate() + daysUntilThursday);
  thisWeekThursday.setHours(12, 0, 0, 0);
  
  // If it's already past Thursday noon, or it's Saturday/Sunday after the market
  if (currentDay === 0 || currentDay === 6 || 
      (currentDay === 4 && easternTime.getHours() >= 12) || 
      currentDay === 5) {
    // Move to next week's Thursday
    thisWeekThursday.setDate(thisWeekThursday.getDate() + 7);
  }
  
  return thisWeekThursday;
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