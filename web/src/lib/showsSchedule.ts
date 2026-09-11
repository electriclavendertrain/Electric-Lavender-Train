/** Merges normalized events and groups them by Pacific month. */

import type { NormalizedShowsEvent } from "../sanity/normalize";
import { getPacificMonthKey, getPacificMonthLabel } from "./dateFormat";

export interface ShowsMonthGroup {
  /** Pacific month key, e.g. "2026-08". Stable across rebuilds. */
  key: string;
  /** The `id` its heading carries, and the target of its month-nav link. */
  anchorId: string;
  /** Human-readable heading, e.g. "August 2026". */
  label: string;
  events: NormalizedShowsEvent[];
}

/** Public and private upcoming events arrive from two separate queries, each already sorted, and have to be interleaved into one stream so a private booking sits in its true chronological position rather than after every public show. */
export function mergeUpcomingEvents(
  publicShows: readonly NormalizedShowsEvent[],
  privateEvents: readonly NormalizedShowsEvent[],
): NormalizedShowsEvent[] {
  return [...publicShows, ...privateEvents].sort((a, b) => {
    const delta = Date.parse(a.startDateTime) - Date.parse(b.startDateTime);
    if (delta !== 0) return delta;
    return a._id < b._id ? -1 : a._id > b._id ? 1 : 0;
  });
}

/** Groups an already-sorted stream by Pacific month, preserving order. */
export function groupByPacificMonth(
  events: readonly NormalizedShowsEvent[],
): ShowsMonthGroup[] {
  const groups = new Map<string, ShowsMonthGroup>();

  for (const event of events) {
    const key = getPacificMonthKey(event.startDateTime);
    let group = groups.get(key);

    if (!group) {
      group = {
        key,
        anchorId: `shows-${key}`,
        label: getPacificMonthLabel(event.startDateTime),
        events: [],
      };
      groups.set(key, group);
    }

    group.events.push(event);
  }

  return [...groups.values()];
}
