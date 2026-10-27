<div align="center">
  <a href="https://eltwebsite.netlify.app/">
    <img src="./web/src/assets/images/elt-logo.jpg" alt="The Electric Lavender Train" width="760" />
  </a>

# The Electric Lavender Train

**A fast, accessible home on the web for California Central Coast live music.**

[![Live preview](https://img.shields.io/badge/Live_preview-eltwebsite.netlify.app-C8A86B?style=for-the-badge)](https://eltwebsite.netlify.app/)
![Future home](https://img.shields.io/badge/Future_home-theelectriclavendertrain.com-A07BEF?style=for-the-badge)

![Astro](https://img.shields.io/badge/Astro_7-0B0B12?style=flat-square&logo=astro&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity_Studio_6-F03E2F?style=flat-square&logo=sanity&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
</div>

---

## About the project

This repository contains the official website and content-management system for **The Electric Lavender Train**, a high-energy dance band performing across California's Central Coast.

The project pairs a statically generated Astro website with a tailored Sanity Studio. Editors can manage shows, music, band members, testimonials, approved media, merchandise, and page copy without turning the public site into a client-rendered application.

> **Current preview:** [eltwebsite.netlify.app](https://eltwebsite.netlify.app/)  
> **Planned production domain:** `theelectriclavendertrain.com`

The Netlify address is the current hosted preview. Domain connection, final content promotion, service authentication, and launch verification remain part of the production cutover.

## Experience highlights

- **Editorially managed pages** for Home, About, Shows, Music, Gallery & Merchandise, and Contact & Booking.
- **Build-time Sanity data fetching** through typed GROQ queries and `sanityClient.fetch(...)`, with normalization and production guards applied before Astro generates the public pages.
- **Public and private event handling** with deliberate redaction of private booking details.
- **Four native inquiry forms** for booking, merchandise, general questions, and content-removal requests.
- **Hosted newsletter boundary** using Brevo for signup, double opt-in, unsubscribe, and campaign delivery—the Astro site never collects newsletter addresses.
- **Media and testimonial intake boundaries** designed for separate, Hunter-owned Google Forms when those workflows are enabled.
- **Responsive, keyboard-friendly UI** with semantic structure, visible focus, reduced-motion support, honest empty states, and no-JavaScript fallbacks where promised.
- **Static performance and security model**: browsers receive generated HTML and assets rather than querying Sanity directly.
- **Launch-aware content guards** that prevent incomplete production content from silently becoming public.

## Architecture

```text
Sanity Studio
    │
    │ published editorial content
    ▼
Astro build ── GROQ queries ── normalization and production guards
    │
    ▼
Static HTML, CSS, images, and small browser scripts
    │
    ▼
Netlify
```

External submissions remain intentionally separate:

```text
Contact & Booking ── native POST ── Formspree
Newsletter links ────────────────── Brevo-hosted forms
Event media ─────────────────────── Google Form, when enabled
Testimonials ────────────────────── separate Google Form, when enabled
```

Astro page modules fetch Homepage, About, Shows, Music, Gallery & Merchandise, Contact, event, and testimonial data from Sanity during static generation. The browser never receives a Sanity API token and does not query the Sanity Content Lake at runtime. A content change becomes public only after a new static build.

## Repository map

| Path       | Purpose                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `web/`     | Astro website, components, styles, routes, browser scripts, GROQ queries, and normalized frontend data |
| `studio/`  | Sanity Studio configuration, content schemas, editor structure, schema extraction, and TypeGen         |
| `.github/` | Scheduled check for event time-boundary changes and conditional Netlify rebuild workflow               |
| `docs/`    | Private, gitignored operating notes and project records; intentionally unavailable on GitHub           |
| `skele/`   | Read-only historical design and feature references; excluded from Git                                  |

Generated Sanity files are committed for review but must not be edited by hand:

- `studio/schema.json`
- `web/src/sanity/sanity.types.ts`

## Public routes

| Route                                  | Purpose                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                                    | Homepage, upcoming shows, testimonials, booking, and newsletter entry points            |
| `/about`                               | Band story, member profiles, testimonials, and optional testimonial submission link     |
| `/shows`                               | Public upcoming and past performances                                                   |
| `/music`                               | Releases, streaming links, and approved media                                           |
| `/gallery-merch`                       | Approved gallery media, merchandise inquiries, and optional event-media submission link |
| `/contact-booking`                     | Booking, merchandise, general, and content-removal inquiry forms                        |
| `/privacy`, `/terms`, `/accessibility` | Public policy and accessibility information                                             |

Provider confirmation routes also exist for future dashboard redirects. They are intentionally excluded from primary navigation and search indexing.

## Local development

### Requirements

- Node.js **22.12 or newer**
- npm
- Access to the intended Sanity project and dataset

Clone the repository, then install each workspace independently:

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

Add the appropriate local values to each `.env` file. Never commit environment files or credentials.

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

## Environment variables

Only variable names and responsibilities belong in Git. Real values stay in local `.env` files and the appropriate hosting dashboard.

### Website

| Variable                            | Responsibility                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `PUBLIC_SANITY_PROJECT_ID`          | Sanity project read during the static build                                           |
| `PUBLIC_SANITY_DATASET`             | Dataset used for the build, normally `development` locally and `production` at launch |
| `PUBLIC_FORMSPREE_BOOKING_ENDPOINT` | Booking inquiry destination                                                           |
| `PUBLIC_FORMSPREE_MERCH_ENDPOINT`   | Merchandise inquiry destination                                                       |
| `PUBLIC_FORMSPREE_OTHER_ENDPOINT`   | General inquiry destination                                                           |
| `PUBLIC_FORMSPREE_REMOVAL_ENDPOINT` | Content-removal request destination                                                   |
| `PUBLIC_NEWSLETTER_SIGNUP_URL`      | Brevo-hosted double-opt-in signup form                                                |
| `PUBLIC_NEWSLETTER_UNSUBSCRIBE_URL` | Independent Brevo-hosted unsubscribe form                                             |

Each optional public integration fails closed: an absent or invalid URL disables only its own entry point and does not expose a broken form.

### Studio

| Variable                   | Responsibility                                       |
| -------------------------- | ---------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project opened by Studio and the CLI          |
| `SANITY_STUDIO_DATASET`    | Dataset edited by Studio and used for schema tooling |

## Validation

Run the standard checks before opening a pull request or preparing a deploy:

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

Interaction changes should also be checked at mobile and desktop widths, with a keyboard, reduced motion, and JavaScript disabled wherever a fallback is promised.

## Deployment

The current preview is served by Netlify at [eltwebsite.netlify.app](https://eltwebsite.netlify.app/).

Expected Netlify build settings:

| Setting           | Value                                 |
| ----------------- | ------------------------------------- |
| Base directory    | `web`                                 |
| Build command     | `npm run build`                       |
| Publish directory | `dist` relative to the base directory |
| Node.js           | `>=22.12.0`                           |

Astro reads public configuration at build time. Any Sanity publication or environment-variable change requires a rebuild before the generated site can reflect it.

The repository also contains a daily GitHub Actions workflow that checks whether an event crossed a time boundary and requests a Netlify rebuild only when the static show lists may be stale. Production ownership, alerting, hook configuration, and final verification must be completed during launch.

## Content and service boundaries

- Sanity contains public editorial content—not form submissions, newsletter subscribers, or secrets.
- Formspree receives inquiry data through native form navigation so its hosted CAPTCHA flow remains available.
- Brevo owns newsletter consent, double opt-in, suppression, and campaign delivery.
- Google Forms will own event-media uploads and testimonial intake when those two independent workflows are enabled.
- Merchandise is inquiry-only. The website has no cart, checkout, or payment collection.
- Venmo is a tip link only.
- YouTube embeds use the privacy-enhanced host and load only after visitor activation.

## Launch path

The project is in pre-production hardening. The high-level path to `theelectriclavendertrain.com` is:

1. Receive and approve the remaining official photos and member biographies.
2. Finish the two Google Form intake workflows and the client Studio walkthrough.
3. Complete the Sanity, GitHub Actions, and Netlify rebuild configuration.
4. Promote the approved Sanity development snapshot to production with verified backups.
5. Connect the GoDaddy-managed domain and verify HTTPS and redirects.
6. Authenticate the Brevo sending domain and complete deliverability testing.
7. Apply Formspree production-domain restrictions and test all inquiry flows.
8. Reconcile legal pages and operating documentation against the live configuration.
9. Run final end-to-end launch and accessibility verification.

## Project principles

- Prefer semantic Astro, CSS, and small browser scripts over unnecessary client frameworks.
- Keep meaningful editorial content in Sanity and infrastructure behavior in code.
- Preserve honest empty states and never invent client facts or testimonials.
- Keep secrets out of Git and browser-delivered JavaScript.
- Treat accessibility, privacy, content rights, and operational ownership as launch requirements.

## License and use

This repository does not currently provide an open-source license. The Electric Lavender Train name, branding, editorial content, photographs, audio, and other media remain the property of their respective owners and may not be reused without permission.

---

<div align="center">
  Built for <strong>The Electric Lavender Train</strong>.<br />
  <a href="https://eltwebsite.netlify.app/">Visit the current site preview →</a>
</div>
