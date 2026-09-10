/**
 * The Contact & Booking forms' provider integration boundary — the file in
 * this project that knows Formspree-specific mechanics (endpoint URLs and
 * validation, its honeypot field name). `contactForms.ts` and
 * `contactData.ts` are provider-neutral: standard HTML forms, stable field
 * names, and validation/UI that has no idea Formspree exists. The state
 * this module exposes to the DOM is provider-neutral too — see
 * `ContactForms.astro`'s `data-delivery-configured` attribute, which is
 * named for what it means (this inquiry type's delivery is configured),
 * not for which provider currently backs it.
 *
 * Submission itself is NOT this module's job: a valid form is an ordinary
 * `<form method="POST" action="…">` the browser submits natively straight to
 * Formspree, identically with or without JavaScript. That is a deliberate
 * choice, not an oversight — Formspree rejects an AJAX
 * (`fetch`/`Accept: application/json`) submission while its built-in
 * reCAPTCHA protection is enabled unless a separate, custom reCAPTCHA
 * key/token integration is added, and this project keeps that built-in
 * CAPTCHA enabled rather than adding one. See `docs/contact-booking.md` §9
 * and `web/src/scripts/contactForms.ts`'s module doc comment.
 *
 * `ContactForms.astro` DOES import Formspree-specific values from here
 * directly — `HONEYPOT_FIELD_NAME`, `SUBJECT_FIELD_NAME`,
 * `INQUIRY_TYPE_FIELD_NAME`, and the resolved `endpoint` string (rendered as
 * that form's `action`) — because it has to
 * render them into markup somewhere. That's a normal call into the
 * boundary, not a leak: the component never hardcodes a Formspree-specific
 * string itself. What genuinely is NOT isolated to this one file: the
 * honeypot/hidden-field *markup structure* (a wrapped, visually-hidden text
 * input; two static hidden inputs) lives in `ContactForms.astro`, because
 * this file is plain TypeScript and can't emit Astro markup. A future
 * provider migration would touch this file for all endpoint logic, AND that
 * markup block in `ContactForms.astro` (clearly commented there) — see
 * `docs/contact-booking.md`'s provider-migration section for the complete,
 * honest list rather than an oversimplified "one file" claim.
 *
 * A previous pass assumed Netlify Forms. That integration has been removed
 * entirely — no `data-netlify` attribute, no `netlify-honeypot` attribute,
 * no hidden `form-name` field, no POST to `/`. The site may still end up
 * hosted on Netlify, but form delivery no longer depends on it.
 *
 * One Formspree project, four separately configurable forms — one per
 * inquiry type (Booking/Merch/Other/Content Removal Request), each with its
 * own endpoint URL, read from its own env var (see `getFormspreeEndpoint`).
 * An endpoint that is missing or doesn't look like a real Formspree URL
 * resolves to `null`: a **fail-closed** state. That specific inquiry type's
 * submit control stays disabled and the direct-email fallback is what's
 * actually usable — never a form that silently pretends to work. No real
 * Formspree ID is ever invented or hardcoded anywhere in this codebase —
 * this is a per-environment, per-inquiry-type check, not a claim about any
 * particular environment's current values. `.env.example` deliberately
 * ships all four empty as a template; a real environment (a developer's own
 * local `web/.env`, or the deployed site's own environment variables) may
 * have some or all four genuinely configured with real endpoint URLs — see
 * `docs/contact-booking.md` §9 for the current state of what's actually
 * configured where.
 */

import type { ContactInquiryType } from "../data/siteConfig";

/**
 * Formspree's own honeypot convention: a real, empty text field named
 * `_gotcha`. If it arrives filled in, Formspree silently discards the
 * submission as spam (responding as if it succeeded, so a bot gets no
 * signal it was caught). `ContactForms.astro` hides the field from sight,
 * the accessibility tree, and the tab order — never `type="hidden"`, which
 * would not exercise a bot's normal form-filling behavior.
 */
export const HONEYPOT_FIELD_NAME = "_gotcha";

/**
 * Formspree's reserved field name for the notification email's subject
 * line — a plain form field, not an API parameter. Set as a static hidden
 * input per form in `ContactForms.astro` (never computed by JavaScript), so
 * the subject is correct identically whether or not scripting runs.
 *
 * **Corrected 2026-09-10:** this was previously `_subject`. Formspree's
 * current documented special field name for the notification subject is
 * `subject`, without a leading underscore — the underscore-prefixed form is
 * stale. Renaming this constant changes only the HTML `name` attribute sent
 * in future submissions; it does not touch this file's own internal
 * identifier (`SUBJECT_FIELD_NAME`) or anything already delivered to
 * Formspree under the old key. **Any Formspree dashboard rule, Zapier/
 * integration mapping, or CSV export column that references the old
 * `_subject` (or the field-name changes below) should be reviewed after
 * this rename** — historical submissions keep whatever field keys they were
 * actually submitted with; this constant only governs new submissions going
 * forward.
 */
export const SUBJECT_FIELD_NAME = "subject";

/**
 * Formspree has no reserved meaning for "inquiry type" — this is a project-
 * specific hidden field, static per form (`booking`/`merch`/`other`/
 * `removal`), so a notification email is unambiguous even without reading
 * the subject line closely. Named `Inquiry Type` (not the internal
 * `inquiryType` identifier) so it reads as a plain column/label in
 * Formspree's dashboard and email notifications, matching the readable-
 * field-name convention used for every other custom field — see
 * `contactData.ts`'s `ContactFieldConfig.submissionName`.
 */
export const INQUIRY_TYPE_FIELD_NAME = "Inquiry Type";

/**
 * Which env var holds each inquiry type's Formspree endpoint. Astro only
 * exposes `PUBLIC_`-prefixed variables to client-side code, and this value
 * is read both server-side, at build time (to set an unconfigured form's
 * `<form action>` and `disabled` state in `ContactForms.astro`) and
 * client-side, at runtime (`contactForms.ts` reads it back via
 * `form.getAttribute("action")` only to decide whether that form is
 * configured — never to build a request; the actual submission is the
 * browser's own native POST to that same `action` URL, not a `fetch` this
 * script issues). So all four carry the `PUBLIC_` prefix — these are not
 * secrets; a plain HTML form's `action` URL is visible in page source
 * regardless of how it gets there.
 *
 * Each `import.meta.env.PUBLIC_…` access below is written out literally
 * (not computed via a dynamic key) because Vite's static build-time
 * replacement for `PUBLIC_`-prefixed variables requires that literal form.
 */
const ENDPOINT_ENV_VARS: Record<ContactInquiryType, string | undefined> = {
  booking: import.meta.env.PUBLIC_FORMSPREE_BOOKING_ENDPOINT,
  merch: import.meta.env.PUBLIC_FORMSPREE_MERCH_ENDPOINT,
  other: import.meta.env.PUBLIC_FORMSPREE_OTHER_ENDPOINT,
  // Independently configurable — a fourth Formspree form, from the same
  // Formspree project or a different one, so Content Removal Request can go
  // live on its own schedule. Fails closed exactly like the other three.
  removal: import.meta.env.PUBLIC_FORMSPREE_REMOVAL_ENDPOINT,
};

/**
 * A real Formspree endpoint is `https://formspree.io/f/<form id>`. Anything
 * else — empty, a typo, a copy-pasted dashboard URL, `http://` instead of
 * `https://` — is treated as "not configured" rather than trusted and sent
 * a real visitor submission blindly.
 */
function isValidFormspreeEndpoint(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "formspree.io" && /^\/f\/\S+/.test(url.pathname);
  } catch {
    return false;
  }
}

/**
 * The real "is this inquiry type's delivery configured" check. Returns the
 * validated endpoint URL, or `null` if missing/malformed — the fail-closed
 * state `ContactForms.astro` uses to decide that form's `action` and
 * `disabled` state, independently of whether the public contact email is
 * configured (`isContactEmailConfigured()` in `siteConfig.ts` is a
 * completely separate check — a real Gmail address must never make an
 * unconfigured Formspree form appear functional).
 */
export function getFormspreeEndpoint(inquiry: ContactInquiryType): string | null {
  const raw = ENDPOINT_ENV_VARS[inquiry];
  return isValidFormspreeEndpoint(raw) ? raw : null;
}
