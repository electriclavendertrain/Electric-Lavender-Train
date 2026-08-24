// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

export default defineConfig({
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
    }),
  ],

  // The Media & Merch page was renamed to Gallery & Merchandise
  // (`/media-merch` -> `/gallery-merch`, see docs/gallery-merch.md). Astro
  // generates a static-compatible redirect page for this route at build
  // time (a `<meta http-equiv="refresh">` HTML file plus a canonical link
  // to the new URL) — no server/adapter is required for `output: "static"`.
  redirects: {
    "/media-merch": "/gallery-merch",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
