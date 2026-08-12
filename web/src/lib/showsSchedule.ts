/**
 * Assembles the Shows page's upcoming stream: merge the two normalized
 * sources into one chronological list, then group that list by Pacific
 * calendar month for the month headings and the jump navigation.
 *
 * Both steps run at build time, after normalization — never on raw Sanity
 * results (`docs/shows.md` §10).
 */

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

/**
 * Public and private upcoming events arrive from two separate queries, each
 * already sorted, and have to be interleaved into one stream so a private
 * booking sits in its true chronological position rather than after every
 * public show.
 *
 * Sorting on the parsed start instant (not the raw string) keeps events with
 * differently-formatted-but-equivalent ISO values ordered correctly. `_id` is
 * the tiebreaker, mirroring the queries' own `_id asc`, so two events sharing
 * a start instant land in the same order on every rebuild.
 */
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

/**
 * Groups an already-sorted stream by Pacific month, preserving order. A `Map`
 * keeps insertion order, so the groups come out chronological without a
 * second sort.
 *
 * Only months that actually contain a displayable event become groups, which
 * is what makes "never render an empty month" true by construction rather
 * than by filtering afterwards. Nothing here imposes a future cutoff: a show
 * two years out simply produces its own group.
 */
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
