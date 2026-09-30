import type {Template} from 'sanity'

/**
 * Two fast entry points for the `event` type, replacing the generic
 * auto-generated "New event" template so the client picks the kind of
 * booking up front instead of filling in visibility manually every time.
 */
export const eventTemplates: Template[] = [
  {
    id: 'event-public',
    title: 'New Public Show — visible on website',
    schemaType: 'event',
    value: {
      visibility: 'public',
      status: 'scheduled',
    },
  },
  {
    id: 'event-private',
    title: 'New Private Booking — date only',
    schemaType: 'event',
    value: {
      visibility: 'busyOnly',
      status: 'scheduled',
    },
  },
]
