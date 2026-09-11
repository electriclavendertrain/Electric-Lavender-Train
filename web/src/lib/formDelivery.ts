import type { ContactInquiryType } from "../data/siteConfig";

/** Formspree discards submissions whose visually hidden `_gotcha` field is filled. */
export const HONEYPOT_FIELD_NAME = "_gotcha";

/** Formspree's reserved notification-subject field. */
export const SUBJECT_FIELD_NAME = "subject";

/** Readable project-specific field included in every notification. */
export const INQUIRY_TYPE_FIELD_NAME = "Inquiry Type";

// Vite requires literal PUBLIC_ accesses for build-time replacement. These
// endpoint URLs are visible in generated form actions and are not secrets.
const ENDPOINT_ENV_VARS: Record<ContactInquiryType, string | undefined> = {
  booking: import.meta.env.PUBLIC_FORMSPREE_BOOKING_ENDPOINT,
  merch: import.meta.env.PUBLIC_FORMSPREE_MERCH_ENDPOINT,
  other: import.meta.env.PUBLIC_FORMSPREE_OTHER_ENDPOINT,
  removal: import.meta.env.PUBLIC_FORMSPREE_REMOVAL_ENDPOINT,
};

function isValidFormspreeEndpoint(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "formspree.io" && /^\/f\/\S+/.test(url.pathname);
  } catch {
    return false;
  }
}

/** Returns a validated endpoint or `null`, which keeps only that form disabled. */
export function getFormspreeEndpoint(inquiry: ContactInquiryType): string | null {
  const raw = ENDPOINT_ENV_VARS[inquiry];
  return isValidFormspreeEndpoint(raw) ? raw : null;
}
