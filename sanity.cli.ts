import { defineCliConfig } from 'sanity/cli'

// Used by the Sanity CLI (login, dataset import/export). Values come from .env.local.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
})
