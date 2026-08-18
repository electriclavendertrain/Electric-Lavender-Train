import type {StructureResolver} from 'sanity/structure'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {HomeIcon} from '@sanity/icons/Home'
import {ImagesIcon} from '@sanity/icons/Images'
import {PlayIcon} from '@sanity/icons/Play'
import {TagIcon} from '@sanity/icons/Tag'
import {UsersIcon} from '@sanity/icons/Users'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Page singletons — each opens its one fixed document by id. There is
      // no "+ create" for these; see SINGLETON_TYPES in sanity.config.ts.
      S.listItem()
        .title('Homepage')
        .id('homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .title('About Page')
        .id('aboutPage')
        .icon(UsersIcon)
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      S.listItem()
        .title('Shows Page')
        .id('showsPage')
        .icon(CalendarIcon)
        .child(S.document().schemaType('showsPage').documentId('showsPage')),
      S.listItem()
        .title('Media & Merch Page')
        .id('mediaPage')
        .icon(PlayIcon)
        .child(S.document().schemaType('mediaPage').documentId('mediaPage')),
      S.divider(),
      // Reusable content — ordinary documents, created and deleted freely.
      S.listItem()
        .title('Band Members')
        .id('bandMembers')
        .icon(UsersIcon)
        .child(S.documentTypeList('bandMember').title('Band Members')),
      S.listItem()
        .title('Testimonials')
        .id('testimonials')
        .icon(BlockquoteIcon)
        .child(
          S.documentTypeList('testimonial')
            .title('Testimonials')
            .defaultOrdering([{field: 'displayOrder', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Merchandise')
        .id('merchItems')
        .icon(TagIcon)
        .child(S.documentTypeList('merchItem').title('Merchandise')),
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
        .icon(ImagesIcon)
        .child(S.documentTypeList('mediaItem').title('Media Library')),
    ])
