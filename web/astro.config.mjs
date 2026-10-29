// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import siteConfig from "./src/data/siteConfig.ts";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

/**
 * Normalizes a path to end in "/", matching BaseLayout's canonical URLs and
 * the URL Netlify serves for each built page folder.
 * @param {string} path
 */
const withTrailingSlash = (path) => `${path.replace(/\/+$/, "")}/`;

/**
 * Routes kept out of the sitemap. Each one either sets `noIndex` (the 404,
 * the provider confirmation/status pages, and the third-party notices) or
 * is the static `/media-merch` redirect. Add any new `noIndex` route here.
 */
const SITEMAP_EXCLUDED_PATHS = new Set(
  [
    "/404",
    "/media-merch",
    "/third-party-notices",
    siteConfig.routes.contactBookingThankYou,
    siteConfig.routes.newsletterCheckInbox,
    siteConfig.routes.newsletterConfirmed,
    siteConfig.routes.newsletterUnsubscribed,
  ].map(withTrailingSlash),
);

/**
 * Rewrites a full URL so its path ends in "/".
 * @param {string} url
 */
const urlWithTrailingSlash = (url) => {
  const parsed = new URL(url);
  parsed.pathname = withTrailingSlash(parsed.pathname);
  return parsed.href;
};

export default defineConfig({
  // Canonical production origin; required for the generated sitemap.
  site: siteConfig.siteUrl,

  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
    }),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED_PATHS.has(withTrailingSlash(new URL(page).pathname)),
      serialize: (item) => ({ ...item, url: urlWithTrailingSlash(item.url) }),
    }),
  ],

  // Preserve the retired /media-merch URL in the static build.
  redirects: {
    "/media-merch": "/gallery-merch",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
