import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  deployment: {
    /**
     * Auto-updates disabled: the project pins Sanity 6.8.0, and the
     * upgrade-to-6.9.0 prompt this produces is what caused the dependency
     * and lockfile instability repaired in Checkpoint 3A. Development and
     * deployment use the committed, tested versions until the auto-update
     * channel (pinned / tested-upgrade / stable) is deliberately chosen as
     * part of the deployment phase.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: false,
  },
  typegen: {
    path: '../web/src/sanity/queries.ts',
    schema: 'schema.json',
    generates: '../web/src/sanity/sanity.types.ts',
  },
})
