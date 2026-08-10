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

/** Short month/day pair for the compact date badge, e.g. { month: "Aug", day: "22" }, in Pacific time. */
export function getEventDateParts(startISO: string): {
  month: string;
  day: string;
} {
  const date = new Date(startISO);
  return {
    month: MONTH_SHORT_FORMAT.format(date),
    day: DAY_NUMBER_FORMAT.format(date),
  };
}
