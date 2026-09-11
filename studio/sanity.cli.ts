import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  deployment: {
    /** Sanity CLI dataset configuration and TypeGen output settings. */
    autoUpdates: false,
  },
  typegen: {
    path: '../web/src/sanity/queries.ts',
    schema: 'schema.json',
    generates: '../web/src/sanity/sanity.types.ts',
  },
})
