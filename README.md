<div align="center">
  <a href="https://theelectriclavendertrain.com/">
    <img src="./web/src/assets/images/elt-logo.jpg" alt="The Electric Lavender Train" width="760" />
  </a>

# The Electric Lavender Train

**A fast, accessible home on the web for California Central Coast live music.**

[![Live site](https://img.shields.io/badge/Live-theelectriclavendertrain.com-A07BEF?style=for-the-badge)](https://theelectriclavendertrain.com/)

![Astro](https://img.shields.io/badge/Astro_7-0B0B12?style=flat-square&logo=astro&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity_Studio_6-F03E2F?style=flat-square&logo=sanity&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
</div>

---

## About the project

This repository contains the official website and content-management system for **The Electric Lavender Train**, a high-energy dance band performing across California's Central Coast.

The site is live at **[theelectriclavendertrain.com](https://theelectriclavendertrain.com/)**. A statically generated Astro website is paired with a tailored Sanity Studio, so the band can manage shows, music, members, testimonials, media, merchandise, and page copy itself. The public site stays a set of fast static pages rather than a client-rendered application.

## Highlights

- **Editor-managed pages** for Home, About, Shows, Music, Gallery & Merchandise, and Contact & Booking.
- **Automatic publishing:** publishing in Sanity Studio triggers a Netlify rebuild. A nightly check rebuilds the site only when a show has started or ended, so "upcoming" and "past" lists stay correct.
- **Public and private events:** private bookings show only a date and time, never client details.
- **Four native inquiry forms** for booking, merchandise, general questions, and content removal. They post directly to Formspree, keep its CAPTCHA flow, and clear themselves when a visitor returns after sending.
- **Hosted newsletter:** signup, double opt-in, unsubscribe, and campaigns run on Brevo's authenticated sending domain. The website never collects newsletter addresses itself.
- **Separate intake for fan media and testimonials** through two Google Forms.
- **Accessible by design:** semantic HTML, keyboard-friendly dialogs and tabs, visible focus, reduced-motion support, honest empty states, and no-JavaScript fallbacks where promised.
- **Search-ready:** canonical and Open Graph metadata, event structured data, a generated sitemap, and `robots.txt`.
- **Guarded builds:** production builds fail rather than publish incomplete or test content.

## Architecture

```text
Sanity Studio (production dataset)
    │  publish ──► Sanity webhook ──► Netlify build hook
    ▼
Astro build ── GROQ queries ── normalization and production guards
    │
    ▼
Static HTML, CSS, images, sitemap, and small browser scripts
    │
    ▼
Netlify ── https://theelectriclavendertrain.com

GitHub Actions (nightly) ── show started or ended? ──► Netlify build hook
```

External submissions stay outside the website:

```text
Contact & Booking ── native POST ── Formspree
Newsletter links ────────────────── Brevo-hosted forms
Event media ─────────────────────── Google Form
Testimonials ────────────────────── separate Google Form
```

Pages fetch their content from Sanity at build time. The browser never receives a Sanity API token and never queries Sanity's content API; it only loads public images from Sanity's CDN.

## Repository map

| Path       | Purpose                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `web/`     | Astro website: pages, components, styles, browser scripts, GROQ queries, and data normalization |
| `studio/`  | Sanity Studio configuration, content schemas, editor structure, schema extraction, and TypeGen         |
| `.github/` | Nightly workflow that rebuilds the site when a show crosses its start or end time                |
| `docs/`    | Private, gitignored operating notes and owner/developer guides; not published to GitHub          |
| `skele/`   | Read-only historical design references; excluded from Git                                              |

Generated Sanity files are committed for review but must not be edited by hand:

- `studio/schema.json`
- `web/src/sanity/sanity.types.ts`

## Public routes

| Route                                     | Purpose                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                                       | Homepage: hero, band photos, upcoming shows, testimonials, booking, and newsletter       |
| `/about/`                                 | Band story, member profiles, testimonials, and testimonial submission link              |
| `/shows/`                                 | Upcoming and past performances                                                          |
| `/music/`                                 | Releases, streaming links, featured video, and label information                        |
| `/gallery-merch/`                         | Photo and video gallery, inquiry-only merchandise, and event-media submission link      |
| `/contact-booking/`                       | Booking, merchandise, general, and content-removal inquiry forms, plus FAQ              |
| `/privacy/`, `/terms/`, `/accessibility/` | Privacy Policy, Terms of Use, and accessibility statement                              |

Pages are built as folders, so every route ends in `/`. Internal links, canonical URLs, and the sitemap all use that form. Confirmation pages for form and newsletter providers also exist; they are excluded from navigation, the sitemap, and search indexing.

## Local development

### Requirements

- Node.js **22.12 or newer**
- npm
- Access to the band's Sanity project

Clone the repository, then install each workspace separately:

```bash
git clone https://github.com/electriclavendertrain/Electric-Lavender-Train.git
cd Electric-Lavender-Train

cd web
npm install
cp .env.example .env

cd ../studio
npm install
cp .env.example .env
```

Fill in each `.env` file. Use the `development` dataset for local work. Never commit environment files or credentials.

### Run the website

```bash
cd web
npm run dev
```

### Run Sanity Studio

```bash
cd studio
npm run dev
```

The Studio labels itself with the dataset it is editing, and shows an amber banner on any dataset other than production.

## Environment variables

Only variable names and responsibilities belong in Git. Real values live in local `.env` files and the hosting dashboard.

### Website

| Variable                            | Responsibility                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `PUBLIC_SANITY_PROJECT_ID`          | Sanity project read during the static build                                           |
| `PUBLIC_SANITY_DATASET`             | `development` locally; `production` on Netlify                                        |
| `PUBLIC_FORMSPREE_BOOKING_ENDPOINT` | Booking inquiry destination                                                           |
| `PUBLIC_FORMSPREE_MERCH_ENDPOINT`   | Merchandise inquiry destination                                                       |
| `PUBLIC_FORMSPREE_OTHER_ENDPOINT`   | General inquiry destination                                                           |
| `PUBLIC_FORMSPREE_REMOVAL_ENDPOINT` | Content-removal request destination                                                   |
| `PUBLIC_NEWSLETTER_SIGNUP_URL`      | Brevo-hosted double-opt-in signup form                                                |
| `PUBLIC_NEWSLETTER_UNSUBSCRIBE_URL` | Brevo-hosted unsubscribe form                                                         |

Each optional integration fails closed. An absent or invalid URL hides only its own entry point rather than showing a broken form.

### Studio

| Variable                   | Responsibility                                       |
| -------------------------- | ---------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project opened by Studio and the CLI          |
| `SANITY_STUDIO_DATASET`    | Dataset Studio edits; `production` for the hosted Studio |

### GitHub Actions

| Name                     | Type       | Responsibility                                          |
| ------------------------ | ---------- | ------------------------------------------------------- |
| `SANITY_DATASET`         | Variable   | Dataset the nightly show check reads (`production`)     |
| `NETLIFY_BUILD_HOOK_URL` | Secret     | Netlify build hook the nightly check calls when needed  |

## Validation

Run these checks before committing:

```bash
cd web
npm run astro -- check
npm run build

cd ../studio
npm run build
npx eslint .

cd ..
git diff --check
```

After a schema or GROQ projection change, regenerate and review the typed contract before building:

```bash
cd studio
npm run types
```

Check interaction changes at mobile and desktop widths, with a keyboard, with reduced motion, and with JavaScript disabled wherever a fallback is promised.

## Deployment

The production site is served by Netlify at [theelectriclavendertrain.com](https://theelectriclavendertrain.com/). `www` and the default Netlify address redirect to it.

| Setting           | Value                                    |
| ----------------- | ---------------------------------------- |
| Base directory    | `web`                                    |
| Build command     | `npm run build`                          |
| Publish directory | `dist` (relative to the base directory)  |
| Node.js           | `NODE_VERSION=22`                        |

A deploy happens when:

- code is pushed to `main`;
- content is published in Sanity Studio (through a webhook);
- the nightly GitHub Actions check finds a show that started or ended in the last 25 hours; or
- someone triggers a deploy manually in Netlify.

Astro reads public configuration at build time, so a changed environment variable takes effect only after the next deploy. Deploy the hosted Studio with `npm run deploy` from `studio/` only when Studio code or schemas change, with the dataset set to `production`.

## Content and service boundaries

- Sanity holds public editorial content only. Form submissions, newsletter subscribers, and secrets never go there.
- Formspree receives inquiries through native form navigation, which keeps its hosted CAPTCHA working.
- Brevo owns newsletter consent, double opt-in, suppression, and campaign delivery.
- Google Forms handle event-media uploads and testimonial intake as two independent workflows.
- Merchandise is inquiry-only; the website has no cart, checkout, or payment collection. Venmo is a tip link only.
- YouTube embeds use the privacy-enhanced host and load only after a visitor chooses to play.
- The site has no analytics, advertising pixels, or tracking cookies.

## Project principles

- Prefer semantic Astro, CSS, and small browser scripts over client frameworks.
- Keep editorial content in Sanity and infrastructure behavior in code.
- Keep honest empty states; never invent client facts or testimonials.
- Keep secrets out of Git and out of browser-delivered JavaScript.
- Treat accessibility, privacy, content rights, and operational ownership as requirements, not extras.

## License and use

This repository does not currently provide an open-source license. The Electric Lavender Train name, branding, editorial content, photographs, audio, and other media remain the property of their respective owners and may not be reused without permission.

---

<div align="center">
  Built for <strong>The Electric Lavender Train</strong>.<br />
  <a href="https://theelectriclavendertrain.com/">Visit theelectriclavendertrain.com →</a>
</div>
