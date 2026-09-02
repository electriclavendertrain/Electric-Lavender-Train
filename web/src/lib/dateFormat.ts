/**
 * Every event time is formatted in America/Los_Angeles, explicitly, on every
 * call — never the build machine's, Node's, or the browser's default
 * timezone (docs/phase3-plan.md §4). "Same day" is decided by comparing
 * Pacific calendar dates, not raw UTC dates, since a Pacific evening show
 * can cross UTC midnight while still being the same local day.
 */
const TIME_ZONE = "America/Los_Angeles";

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DATE_KEY_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_SHORT_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  month: "short",
});

const DAY_NUMBER_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  day: "2-digit",
});

const YEAR_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
});

/** Drives both the month key and the month label, so they can never disagree. */
const MONTH_PARTS_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
});

const MONTH_NUMBER_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  month: "2-digit",
});

function formatDay(date: Date): string {
  return DAY_FORMAT.format(date);
}

function formatTime(date: Date): string {
  return TIME_FORMAT.format(date);
}

function meridiemOf(time: string): string {
  return time.match(/(AM|PM)$/)?.[1] ?? "";
}

function stripMeridiem(time: string): string {
  return time.replace(/\s?(AM|PM)$/, "");
}

function isSamePacificDay(a: Date, b: Date): boolean {
  return DATE_KEY_FORMAT.format(a) === DATE_KEY_FORMAT.format(b);
}

/**
 * Formats an event's start (and optional end) instant in Pacific time:
 *  - Same Pacific day:      "Saturday, Aug 22, 2026 · 7:00–10:00 PM"
 *  - Different Pacific days: "Saturday, Aug 22, 2026 · 7:00 PM – Sunday, Aug 23, 2026 · 1:00 AM"
 *  - No end time:            "Saturday, Aug 22, 2026 · 7:00 PM"
 */
export function formatEventDateTime(
  startISO: string,
  endISO: string | null | undefined,
): string {
  const start = new Date(startISO);
  const startDay = formatDay(start);
  const startTime = formatTime(start);

  if (!endISO) {
    return `${startDay} · ${startTime}`;
  }

  const end = new Date(endISO);

  if (isSamePacificDay(start, end)) {
    const endTime = formatTime(end);
    const startDisplay =
      meridiemOf(startTime) === meridiemOf(endTime) ? stripMeridiem(startTime) : startTime;
    return `${startDay} · ${startDisplay}–${endTime}`;
  }

  const endDay = formatDay(end);
  const endTime = formatTime(end);
  return `${startDay} · ${startTime} – ${endDay} · ${endTime}`;
}

/** Short month/day/year parts for the compact date badge, e.g. { month: "Aug", day: "22", year: "2026" }, in Pacific time. */
export function getEventDateParts(startISO: string): {
  month: string;
  day: string;
  year: string;
} {
  const date = new Date(startISO);
  return {
    month: MONTH_SHORT_FORMAT.format(date),
    day: DAY_NUMBER_FORMAT.format(date),
    year: YEAR_FORMAT.format(date),
  };
}

/**
 * True only for a string `Date` can actually parse. Sanity's `datetime` type
 * and the `defined(startDateTime)` GROQ filter both guarantee a *present*
 * value, not a *parseable* one — a raw Content API write can store any
 * string. Normalization uses this to drop malformed records rather than
 * rendering "Invalid Date".
 */
export function isValidDateTime(value: string | null | undefined): value is string {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

/**
 * The value for a `<time datetime="…">` attribute: the same instant,
 * normalized to ISO 8601 UTC. Timezone-independent by construction, so it
 * carries no dependency on the build machine or the visitor's clock — the
 * human-readable text beside it is the Pacific rendering.
 */
export function toDateTimeAttribute(iso: string): string {
  return new Date(iso).toISOString();
}

/**
 * Stable sort/grouping key for an event's PACIFIC calendar month, e.g.
 * "2026-08" — not its UTC month. This distinction is load-bearing: a show at
 * 6pm Pacific on August 31 is 01:00 UTC on September 1, and grouping it under
 * "September 2026" would be wrong for every visitor reading the page.
 */
export function getPacificMonthKey(iso: string): string {
  const date = new Date(iso);
  return `${YEAR_FORMAT.format(date)}-${MONTH_NUMBER_FORMAT.format(date)}`;
}

/** Human-readable Pacific month heading, e.g. "August 2026". */
export function getPacificMonthLabel(iso: string): string {
  return MONTH_PARTS_FORMAT.format(new Date(iso));
}

/**
 * Strict `YYYY-MM-DD` calendar-date validation, e.g. for `musicRelease.releaseDate`.
 * Deliberately does NOT rely on `new Date(value)`'s parsing leniency — a
 * naive `Date.UTC` build silently *rolls over* an out-of-range day
 * (`Date.UTC(2026, 1, 31)` becomes March 3, not an error) rather than
 * rejecting it. This reconstructs the date from its own year/month/day
 * components and confirms none of them changed, so an impossible date like
 * February 31 is rejected outright instead of silently normalizing into a
 * real one.
 */
export function isValidCalendarDateOnly(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const reconstructed = new Date(utc);
  return (
    reconstructed.getUTCFullYear() === year &&
    reconstructed.getUTCMonth() === month - 1 &&
    reconstructed.getUTCDate() === day
  );
}
