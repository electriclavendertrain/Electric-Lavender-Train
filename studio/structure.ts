import type {StructureResolver} from 'sanity/structure'
import {CalendarIcon} from '@sanity/icons/Calendar'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Homepage')
        .id('homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .title('Shows Page')
        .id('showsPage')
        .icon(CalendarIcon)
        .child(S.document().schemaType('showsPage').documentId('showsPage')),
      S.divider(),
      S.listItem()
        .title('Events')
        .id('events')
        .child(
          S.list()
            .title('Events')
            .items([
              S.listItem()
                .title('Next 7 Days')
                .child(
                  S.documentList()
                    .title('Next 7 Days')
                    .schemaType('event')
                    .filter(
                      '_type == "event" && dateTime(startDateTime) >= dateTime(now()) && dateTime(startDateTime) <= dateTime(now()) + 604800',
                    )
                    .defaultOrdering([{field: 'startDateTime', direction: 'asc'}])
                    .apiVersion('2024-01-01'),
                ),
              S.listItem()
                .title('Upcoming Public Shows')
                .child(
                  S.documentList()
                    .title('Upcoming Public Shows')
                    .schemaType('event')
                    .filter(
                      '_type == "event" && visibility == "public" && status == "scheduled" && coalesce(endDateTime, startDateTime) >= now()',
                    )
                    .defaultOrdering([{field: 'startDateTime', direction: 'asc'}])
                    .apiVersion('2024-01-01'),
                ),
              S.listItem()
                .title('Upcoming Private Bookings')
                .child(
                  S.documentList()
                    .title('Upcoming Private Bookings')
                    .schemaType('event')
                    .filter(
                      '_type == "event" && visibility == "busyOnly" && status == "scheduled" && coalesce(endDateTime, startDateTime) >= now()',
                    )
                    .defaultOrdering([{field: 'startDateTime', direction: 'asc'}])
                    .apiVersion('2024-01-01'),
                ),
              S.listItem()
                .title('Past Events')
                .child(
                  S.documentList()
                    .title('Past Events')
                    .schemaType('event')
                    .filter('_type == "event" && coalesce(endDateTime, startDateTime) < now()')
                    .defaultOrdering([{field: 'startDateTime', direction: 'desc'}])
                    .apiVersion('2024-01-01'),
                ),
              S.listItem()
                .title('All Events')
                .child(S.documentTypeList('event').title('All Events')),
            ]),
        ),
      S.listItem()
        .title('Media Library')
        .id('mediaLibrary')
        .child(S.documentTypeList('mediaItem').title('Media Library')),
    ])
