import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {eventTemplates} from './schemaTypes/templates'
import {structure} from './structure'
import {datasetLabel} from './datasetLabel'
import {DatasetNavbar} from './components/DatasetNavbar'

/** Sanity Studio configuration and singleton creation guards. */
const dataset = process.env.SANITY_STUDIO_DATASET as string

const SINGLETON_TYPES = [
  'homepage',
  'aboutPage',
  'showsPage',
  'galleryPage',
  'contactPage',
  'musicPage',
]

export default defineConfig({
  name: 'default',
  // The dataset is fixed at build/deploy time, so label the Studio with it.
  title: `ELT Studio — ${datasetLabel(dataset)}`,

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset,

  plugins: [structureTool({structure}), visionTool()],

  studio: {
    components: {
      // Adds a caution banner on every dataset except production.
      navbar: DatasetNavbar,
    },
  },

  schema: {
    types: schemaTypes,
    // Use named event templates and remove singleton creation options.
    templates: (prev) =>
      [
        ...prev.filter(
          (item) => !SINGLETON_TYPES.includes(item.schemaType) && item.schemaType !== 'event',
        ),
        ...eventTemplates,
      ],
  },

  document: {
    // Also remove singleton entries from the global Create menu.
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => !SINGLETON_TYPES.includes(item.templateId))
      }
      return prev
    },
  },
})
