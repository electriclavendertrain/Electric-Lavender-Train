/**
 * The Contact & Booking forms' provider integration boundary — the file in
 * this project that knows Formspree-specific mechanics (endpoint URLs, its
 * honeypot field name, its AJAX response contract). `contactForms.ts` and
 * `contactData.ts` are provider-neutral: standard HTML forms, stable field
 * names, and validation/UI that has no idea Formspree exists. The state
 * this module exposes to the DOM is provider-neutral too — see
 * `ContactForms.astro`'s `data-delivery-configured` attribute, which is
 * named for what it means (this inquiry type's delivery is configured),
 * not for which provider currently backs it.
 *
 * `ContactForms.astro` DOES import Formspree-specific values from here
 * directly — `HONEYPOT_FIELD_NAME`, `SUBJECT_FIELD_NAME`, and the resolved
 * `endpoint` string — because it has to render them into markup somewhere.
 * That's a normal call into the boundary, not a leak: the component never
 * hardcodes a Formspree-specific string itself. What genuinely is NOT
 * isolated to this one file: the honeypot/hidden-field *markup structure*
 * (a wrapped, visually-hidden text input; two static hidden inputs) lives
 * in `ContactForms.astro`, because this file is plain TypeScript and can't
 * emit Astro markup. A future provider migration would touch this file for
 * all endpoint/submission logic, AND that markup block in
 * `ContactForms.astro` (clearly commented there) — see
 * `docs/contact-booking.md`'s provider-migration section for the complete,
 * honest list rather than an oversimplified "one file" claim.
 *
 * A previous pass assumed Netlify Forms. That integration has been removed
 * entirely — no `data-netlify` attribute, no `netlify-honeypot` attribute,
 * no hidden `form-name` field, no POST to `/`. The site may still end up
 * hosted on Netlify, but form delivery no longer depends on it.
 *
 * One Formspree project, three separately configurable forms — one per
 * inquiry type, each with its own endpoint URL, read from its own env var
 * (see `getFormspreeEndpoint`). An endpoint that is missing or doesn't look
 * like a real Formspree URL resolves to `null`: a **fail-closed** state.
 * That specific inquiry type's submit control stays disabled and the
 * direct-email fallback is what's actually usable — never a form that
 * silently pretends to work. No real Formspree ID is invented anywhere in
 * this codebase; the three env vars are genuinely unset until the site
 * owner creates the Formspree project and fills them in.
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
 */
export const SUBJECT_FIELD_NAME = "_subject";

/**
 * Which env var holds each inquiry type's Formspree endpoint. Astro only
 * exposes `PUBLIC_`-prefixed variables to client-side code, and each value
 * is needed both server-side (an unconfigured form's `<form action>`) and
 * client-side (the AJAX fetch target), so all three carry that prefix —
 * these are not secrets; a plain HTML form's `action` URL is visible in
 * page source regardless of how it gets there.
 *
 * Each `import.meta.env.PUBLIC_…` access below is written out literally
 * (not computed via a dynamic key) because Vite's static build-time
 * replacement for `PUBLIC_`-prefixed variables requires that literal form.
 */
const ENDPOINT_ENV_VARS: Record<ContactInquiryType, string | undefined> = {
  booking: import.meta.env.PUBLIC_FORMSPREE_BOOKING_ENDPOINT,
  merch: import.meta.env.PUBLIC_FORMSPREE_MERCH_ENDPOINT,
  other: import.meta.env.PUBLIC_FORMSPREE_OTHER_ENDPOINT,
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

export interface FormSubmissionResult {
  ok: boolean;
}

/**
 * Formspree's documented AJAX contract: POST the (already-trimmed) field
 * values with `Accept: application/json` so Formspree responds with JSON
 * instead of redirecting to its own default HTML thank-you page, and trust
 * `response.ok` (2xx) as the only signal of real success — this codebase
 * never reports a submission as sent unless Formspree actually accepted it.
 *
 * Sent as `application/x-www-form-urlencoded` (the same encoding a plain
 * HTML form submits with by default), which Formspree accepts identically
 * to multipart form data — this keeps the request body construction
 * unchanged from field values `contactForms.ts` already has as a plain
 * object, with no extra encoding step.
 *
 * Never called with a `null` endpoint — every caller checks
 * `getFormspreeEndpoint` first, mirrored by the submit button's own
 * `disabled` state, so there is no code path where this fires against a
 * fail-closed form.
 */
export async function submitForm(
  endpoint: string,
  data: Record<string, string>,
): Promise<FormSubmissionResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(data).toString(),
  });
  return { ok: response.ok };
}
