const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Parses a "YYYY-MM-DD" string as a local date (avoids UTC off-by-one). */
export function parseDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatFullDate(dateString: string): string {
  const date = parseDateOnly(dateString);
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  return `${weekday}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Short month/day pair for the compact date badge, e.g. { month: "Aug", day: "22" }. */
export function getShowDateParts(dateString: string): {
  month: string;
  day: string;
} {
  const date = parseDateOnly(dateString);
  return {
    month: MONTHS[date.getMonth()].slice(0, 3),
    day: String(date.getDate()).padStart(2, "0"),
  };
}
