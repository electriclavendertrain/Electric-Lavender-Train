/**
 * Music page: progressive-enhancement countdown for upcoming releases.
 *
 * Every release date is already rendered as a plain, readable `<time>`
 * element regardless of scripting (`MusicReleaseCard.astro`) — this only
 * adds a purely supplementary "In N days" span next to it. The span starts
 * `hidden` in the server-rendered markup; if this script never runs (no
 * JavaScript, or it fails), the span stays hidden and the plain date next
 * to it remains fully understandable on its own — the countdown enhancement
 * is simply absent, never a blank or broken element.
 *
 * The day count is calendar days in America/Los_Angeles (`pacificCalendarDayDiff`),
 * not raw UTC or 24h-bucket math — see that function's own doc comment for
 * why this matters across a Pacific daylight-saving transition. A release
 * date that isn't a real calendar date (`isValidCalendarDateOnly` — e.g. a
 * malformed or impossible date like February 31) is treated the same as "no
 * countdown," never a crash or a nonsensical count.
 */
import { isValidCalendarDateOnly, pacificCalendarDayDiff } from "../lib/dateFormat";

const items = document.querySelectorAll<HTMLElement>("[data-countdown]");

for (const item of items) {
  const dateOnly = item.dataset.countdown;
  if (!isValidCalendarDateOnly(dateOnly)) continue;

  const diffDays = pacificCalendarDayDiff(dateOnly);
  item.textContent = diffDays <= 0 ? "Out now" : diffDays === 1 ? "In 1 day" : `In ${diffDays} days`;
  item.hidden = false;
}
