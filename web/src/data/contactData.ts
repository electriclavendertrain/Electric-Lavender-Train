/**
 * Code-owned Contact & Booking page material. No Sanity singleton exists for
 * this route — the page structure, the three inquiry types, and every field
 * are fixed product decisions, not editorial content a client would reword
 * day to day (unlike a heading or a lede). If that changes later, this is
 * where a future `contactPage` singleton's editable slice would be carved
 * out from; nothing here anticipates it.
 *
 * Field lists and inquiry types come directly from the approved task brief,
 * not from `skele/elt-site/`'s reference forms — its React architecture,
 * mock-submit behavior, and placeholder contact details are not reused. Its
 * field *names* (name/email/phone/organization/eventType/etc.) were used
 * only as prior art for what a booking inquiry reasonably asks.
 */

import type { ContactInquiryType } from "./siteConfig";

/** The marker that makes the "contact delivery isn't configured yet"
 * development state unmistakable, mirroring `TEST_BIOGRAPHY_MARKER` and
 * `TEST_PRODUCT_MARKER`. Not mechanically enforced against a Sanity
 * document (there is none here) — enforced instead by the production build
 * guard in `contact-booking.astro`, which fails outright unless
 * `isContactEmailConfigured()` (`siteConfig.ts`) is true. That check is a
 * real email-shape validation, not merely "is this non-null." */
export const TEST_EMAIL_MARKER = "[TEST — PUBLIC EMAIL REQUIRED]";

export const DEFAULT_INQUIRY: ContactInquiryType = "booking";

export const INQUIRY_TABS: {
  value: ContactInquiryType;
  tabLabel: string;
  panelHeading: string;
  /**
   * The Formspree `_subject` value — a clear, fixed email subject line so
   * each inquiry type's notification is immediately distinguishable in an
   * inbox. Deliberately static rather than computed from the visitor's own
   * field values (e.g. event type): a static hidden input works identically
   * with or without JavaScript, which a JS-computed subject would not.
   */
  emailSubject: string;
}[] = [
  {
    value: "booking",
    tabLabel: "Booking Inquiry",
    panelHeading: "Booking Inquiry",
    emailSubject: "New Booking Inquiry — Electric Lavender Train",
  },
  {
    value: "merch",
    tabLabel: "Merch Inquiry",
    panelHeading: "Merch Inquiry",
    emailSubject: "New Merch Inquiry — Electric Lavender Train",
  },
  {
    value: "other",
    tabLabel: "Other",
    panelHeading: "Other Inquiry",
    emailSubject: "New General Inquiry — Electric Lavender Train",
  },
];

/** Generic event categories, not invented client-specific facts — reused as
 * plain descriptive options the same way `bandMember`'s link-type list is a
 * fixed vocabulary rather than editorial content. */
export const EVENT_TYPE_OPTIONS = [
  "Winery or venue show",
  "Private party",
  "Wedding",
  "Corporate event",
  "Festival",
  "Other",
];

export interface ContactFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "textarea";
  required: boolean;
  autoComplete?: string;
  placeholder?: string;
  options?: string[];
  /** Marks the one field the `?item=` URL parameter prefills. */
  isMerchItemField?: boolean;
  /**
   * Rendered as the HTML `maxlength` attribute (browser-enforced) on text/
   * textarea fields, and re-checked in `contactForms.ts` as a defensive
   * second layer. This is a client-side courtesy only, not a security
   * boundary — a direct HTTP request bypasses both — see
   * docs/contact-booking.md's field-limits section for the equivalent
   * receiving-side enforcement this still depends on at deployment.
   */
  maxLength?: number;
}

export const bookingFields: ContactFieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name", maxLength: 100 },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  { name: "phone", label: "Phone", type: "tel", required: false, autoComplete: "tel", maxLength: 40 },
  {
    name: "organization",
    label: "Organization or Venue",
    type: "text",
    required: false,
    autoComplete: "organization",
    maxLength: 150,
  },
  {
    name: "eventType",
    label: "Event Type",
    type: "select",
    required: true,
    options: EVENT_TYPE_OPTIONS,
  },
  { name: "preferredDate", label: "Preferred Date", type: "date", required: false },
  {
    name: "location",
    label: "Event Location",
    type: "text",
    required: true,
    // Deliberately steers away from a residential street address — a city
    // and venue name is what's actually useful for a booking inquiry.
    placeholder: "City and venue, if known",
    maxLength: 200,
  },
  {
    name: "audienceSize",
    label: "Estimated Audience Size",
    type: "text",
    required: false,
    placeholder: "e.g. 150",
    maxLength: 20,
  },
  { name: "message", label: "Event Details", type: "textarea", required: true, maxLength: 3000 },
];

export const merchFields: ContactFieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name", maxLength: 100 },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "merchItem",
    label: "Merchandise Item",
    type: "text",
    required: true,
    isMerchItemField: true,
    maxLength: 150,
  },
  {
    name: "details",
    label: "Quantity, Size, or Other Details",
    type: "textarea",
    required: false,
    maxLength: 3000,
  },
  { name: "message", label: "Message", type: "textarea", required: true, maxLength: 3000 },
];

export const otherFields: ContactFieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name", maxLength: 100 },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  { name: "subject", label: "Subject", type: "text", required: true, maxLength: 150 },
  { name: "message", label: "Message", type: "textarea", required: true, maxLength: 3000 },
];

export const fieldsByInquiry: Record<ContactInquiryType, ContactFieldConfig[]> = {
  booking: bookingFields,
  merch: merchFields,
  other: otherFields,
};

/**
 * Protected interface copy: switcher/section labels, validation messages,
 * and the delivery/privacy explanation. Not editorial content — see the
 * module doc comment.
 */
export const contactCopy = {
  headingId: "contact-forms",
  switcherLabel: "Choose an inquiry type",
  formsHeadingId: "contact-forms-heading",

  intro: {
    kicker: "Get In Touch",
    heading: "Contact & Booking",
    lede: "Have a question, or want ELT at your event? Start below.",
    explanation:
      "Choose the kind of inquiry below, fill in the details, and send it directly from this page. Prefer email? Use the direct address at the bottom of the form instead.",
  },

  formsHeading: "Send an Inquiry",

  requiredSuffix: " (required)",
  optionalSuffix: " (optional)",

  submitLabel: "Send Inquiry",
  submittingLabel: "Sending…",
  successMessage: "Thanks — your inquiry has been sent. We'll get back to you soon.",
  errorMessage:
    "Something went wrong and your inquiry was not sent. Please try again, or use the direct email address below.",

  devEmailNotice: `${TEST_EMAIL_MARKER} Contact delivery is not yet configured for this site. These forms are shown for layout and review only and cannot send a real inquiry until a public contact email is approved.`,

  /**
   * Shown inside a specific panel when THAT inquiry type's own Formspree
   * endpoint isn't configured — a state independent of whether the public
   * contact email above is set. Never implies the form is broken; points at
   * the always-available direct-email fallback instead of a false "coming
   * soon."
   */
  formNotConfiguredNotice:
    "This form isn't connected yet — please use the direct email address below instead.",

  /** Rendered once, applying to all three forms — not tied to any single
   * field, so it isn't repeated per-panel. */
  sensitiveInfoNotice:
    "Please don't include payment card numbers, government ID numbers, or medical information in these forms.",

  /** Just-in-time disclosure rendered beside each Submit button — informational
   * only, never a mandatory agreement checkbox (ordinary inquiries don't need
   * one). `{privacyLinkText}` is replaced with a real link in the component. */
  jitPrivacyNotice: "By submitting, your information is handled as described in our",
  privacyLinkText: "Privacy Policy",

  directEmailIntro: "Prefer to email us directly?",

  privacyHeading: "Privacy & delivery",
  privacyNote:
    "When you submit a form, it's processed by our form provider, Formspree, and delivered to The Electric Lavender Train's Gmail account. We use it to respond to your inquiry and handle it as described in our Privacy Policy — we don't sell it or add you to a marketing list.",

  validation: {
    required: (label: string) => `${label} is required.`,
    email: "Enter a valid email address.",
    tooLong: (label: string, max: number) => `${label} must be ${max} characters or fewer.`,
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

export default contactCopy;
