import {aboutPage} from './aboutPage'
import {bandMember} from './bandMember'
import {contactPage} from './contactPage'
import {event} from './event'
import {galleryPage} from './galleryPage'
import {homepage} from './homepage'
import {mediaItem} from './mediaItem'
import {mediaPage} from './mediaPage'
import {merchItem} from './merchItem'
import {musicPage} from './musicPage'
import {musicRelease} from './musicRelease'
import {showsPage} from './showsPage'
import {testimonial} from './testimonial'

export const schemaTypes = [
  event,
  mediaItem,
  bandMember,
  testimonial,
  merchItem,
  musicRelease,
  homepage,
  aboutPage,
  showsPage,
  galleryPage,
  // Deprecated legacy type — retained read-only, not queried by the
  // frontend. See mediaPage.ts's own doc comment.
  mediaPage,
  contactPage,
  musicPage,
]
