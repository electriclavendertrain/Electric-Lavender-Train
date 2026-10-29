/** Code-owned inquiry fields, limits, labels, and fallback editorial content. */

import type { ContactInquiryType } from "./siteConfig";

/** Prevents an unapproved fallback address from being treated as launch-ready. */
export const TEST_EMAIL_MARKER = "[TEST — PUBLIC EMAIL REQUIRED]";

export const DEFAULT_INQUIRY: ContactInquiryType = "booking";

export const INQUIRY_TABS: {
  value: ContactInquiryType;
  tabLabel: string;
  panelHeading: string;
  /** The Formspree `subject` value — a clear, fixed email subject line so each inquiry type's notification is immediately distinguishable in an inbox. */
  emailSubject: string;
  /** Rendered just below the panel heading, above the disconnected-state notice — a short, purely descriptive orientation sentence for that one inquiry type. */
  panelNote?: string;
}[] = [
  {
    value: "booking",
    tabLabel: "Booking Inquiry",
    panelHeading: "Booking Inquiry",
    emailSubject: "New Booking Inquiry — Electric Lavender Train",
    panelNote: "Share the details of your event so we can review the request.",
  },
  {
    value: "merch",
    tabLabel: "Merch Inquiry",
    panelHeading: "Merch Inquiry",
    emailSubject: "New Merch Inquiry — Electric Lavender Train",
    panelNote:
      "Tell us which item you’re interested in and what you’d like to know.",
  },
  {
    value: "removal",
    tabLabel: "Content Removal Request",
    panelHeading: "Content Removal Request",
    emailSubject: "New Content Removal Request — Electric Lavender Train",
    panelNote:
      "Submitting this form starts a review of your request — it does not guarantee that the content will be removed.",
  },
  {
    value: "other",
    tabLabel: "Other",
    panelHeading: "Other Inquiry",
    emailSubject: "New General Inquiry — Electric Lavender Train",
    panelNote:
      "Use this form for questions that don’t fit booking, merchandise, or content removal.",
  },
];

/** Native (no-JS) approximation of "contains at least one Unicode letter" — used by every Name field and by Merchandise Item, so a value like "123" or blank fails while "Jean-Luc", "O'Brien", "María", "Louis XIV", and "Al3x" (a real nickname with an embedded… */
const REQUIRES_LETTER_PATTERN = ".*\\p{L}.*";

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
  /** The literal HTML `name` attribute this field submits to Formspree. */
  submissionName?: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "url"
    | "select"
    | "textarea";
  required: boolean;
  autoComplete?: string;
  placeholder?: string;
  options?: string[];
  inputMode?:
    "decimal" | "email" | "numeric" | "search" | "tel" | "text" | "url";
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  validationKind?:
    "phone" | "budget" | "requiresLetter" | "positiveInteger" | "url";
  /** Marks the one field the `?item=` URL parameter prefills. */
  isMerchItemField?: boolean;
  /** Optional, short persistent line rendered beneath the field's control and linked to it via `aria-describedby` — for a field whose plain label could otherwise read as a promise (e.g. */
  helperText?: string;
  /** Rendered as the HTML `maxlength` attribute (browser-enforced) on text/ textarea fields, and re-checked in `contactForms.ts` as a defensive second layer. */
  maxLength?: number;
}

export const bookingFields: ContactFieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    autoComplete: "name",
    maxLength: 100,
    pattern: REQUIRES_LETTER_PATTERN,
    validationKind: "requiresLetter",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    required: false,
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "e.g. (805) 555-0123",
    helperText:
      "Use 7 to 15 digits. Spaces, parentheses, +, periods, and hyphens are okay.",
    maxLength: 25,
    pattern: "(?=(?:.*[0-9]){7})(?:[0-9]|\\+|\\(|\\)| |\\.|-){7,25}",
    validationKind: "phone",
  },
  {
    name: "organization",
    submissionName: "Organization or Venue",
    label: "Organization or Venue",
    type: "text",
    required: false,
    autoComplete: "organization",
    maxLength: 150,
  },
  {
    name: "eventType",
    submissionName: "Event Type",
    label: "Event Type",
    type: "select",
    required: true,
    options: EVENT_TYPE_OPTIONS,
  },
  {
    name: "preferredDate",
    submissionName: "Preferred Date",
    label: "Preferred Date",
    type: "date",
    required: true,
  },
  {
    name: "location",
    submissionName: "Event Location",
    label: "Event Location",
    type: "text",
    required: true,
    // Deliberately steers away from a residential street address — a city
    // and/or venue name is what's actually useful for a booking inquiry.
    placeholder: "City and/or venue location",
    maxLength: 200,
  },
  {
    name: "audienceSize",
    submissionName: "Estimated Audience Size",
    label: "Estimated Audience Size",
    type: "number",
    required: false,
    inputMode: "numeric",
    placeholder: "e.g. 150",
    helperText: "If entered, use a whole number greater than zero.",
    min: 1,
    step: 1,
    validationKind: "positiveInteger",
  },
  {
    name: "budget",
    submissionName: "Budget",
    label: "Budget",
    type: "number",
    required: false,
    inputMode: "numeric",
    placeholder: "e.g. 2500",
    helperText:
      "Enter a non-negative whole-dollar amount without symbols or commas.",
    min: 0,
    step: 1,
    validationKind: "budget",
  },
  {
    name: "specialSongRequests",
    submissionName: "Special Song Requests",
    label: "Special Song Requests",
    type: "textarea",
    required: false,
    placeholder: "e.g. a favorite song, or a must-play for your event",
    helperText:
      "We'll do our best, but a request isn't a guarantee it'll be in the set.",
    maxLength: 500,
  },
  {
    name: "message",
    label: "Event Details",
    type: "textarea",
    required: true,
    maxLength: 3000,
  },
];

export const merchFields: ContactFieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    autoComplete: "name",
    maxLength: 100,
    pattern: REQUIRES_LETTER_PATTERN,
    validationKind: "requiresLetter",
  },
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
    submissionName: "Merchandise Item",
    label: "Merchandise Item",
    type: "text",
    required: true,
    isMerchItemField: true,
    maxLength: 150,
    pattern: REQUIRES_LETTER_PATTERN,
    validationKind: "requiresLetter",
  },
  {
    name: "details",
    submissionName: "Quantity, Size, or Other Details",
    label: "Quantity, Size, or Other Details",
    type: "textarea",
    required: false,
    maxLength: 3000,
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    maxLength: 3000,
  },
];

export const otherFields: ContactFieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    autoComplete: "name",
    maxLength: 100,
    pattern: REQUIRES_LETTER_PATTERN,
    validationKind: "requiresLetter",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "subject",
    // Avoid colliding with Formspree's hidden `subject` field.
    submissionName: "Inquiry Subject",
    label: "Subject",
    type: "text",
    required: true,
    maxLength: 150,
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    maxLength: 3000,
  },
];

/** No file uploads: a removal request describes and locates the content in
 * text, it never attaches it. Fields chosen to identify the content and the
 * requester's basis for asking, without requiring an unnecessary legal
 * declaration (e.g. no sworn-statement checkbox) to submit. */
export const removalFields: ContactFieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    autoComplete: "name",
    maxLength: 100,
    pattern: REQUIRES_LETTER_PATTERN,
    validationKind: "requiresLetter",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "contentLocation",
    submissionName: "Content URL or Location",
    label: "URL or Location of Content",
    type: "text",
    required: true,
    placeholder: "Paste a link or describe where the content appears",
    helperText: "Paste the direct link or describe where the content appears.",
    maxLength: 300,
  },
  {
    name: "contentDescription",
    submissionName: "Content Description",
    label: "Description of the Photo, Video, or Content",
    type: "textarea",
    required: true,
    maxLength: 1500,
  },
  {
    name: "reason",
    submissionName: "Reason for Request",
    label: "Reason for the Request or Relationship to the Content",
    type: "textarea",
    required: true,
    maxLength: 1500,
  },
  {
    name: "requestedAction",
    submissionName: "Requested Action",
    label: "Requested Action or Details",
    type: "textarea",
    required: true,
    maxLength: 1500,
  },
];

export const fieldsByInquiry: Record<ContactInquiryType, ContactFieldConfig[]> =
  {
    booking: bookingFields,
    merch: merchFields,
    other: otherFields,
    removal: removalFields,
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

  formsHeading: "Send an Inquiry",

  /** Protected: the FAQ section's own heading and ids. */
  faqSectionId: "faq",
  faqHeadingId: "faq-heading",
  faqHeading: "Frequently Asked Questions",

  requiredSuffix: " (required)",
  optionalSuffix: " (optional)",

  submitLabel: "Send Inquiry",
  /** Shown on the submit button only after a *valid* submission has begun —
   * see `contactForms.ts`'s pending-state handling. Never shown for an
   * invalid submission, which is blocked before this label ever changes. */
  submittingLabel: "Sending…",

  devEmailNotice: `${TEST_EMAIL_MARKER} Use the inquiry forms below to contact the band.`,

  /** Shown inside a specific panel when THAT inquiry type's own Formspree endpoint isn't configured — a state independent of whether the public contact email above is set. */
  formNotConfiguredNotice:
    "Please use the direct email address below for this inquiry.",

  /** Rendered once, applying to all four forms — not tied to any single
   * field, so it isn't repeated per-panel. */
  sensitiveInfoNotice:
    "Please don't include payment card numbers, government ID numbers, or medical information in these forms.",

  /** Just-in-time disclosure rendered beside each Submit button — informational
   * only, never a mandatory agreement checkbox (ordinary inquiries don't need
   * one). `{privacyLinkText}` is replaced with a real link in the component. */
  jitPrivacyNotice:
    "By submitting, your information is handled as described in our",
  privacyLinkText: "Privacy Policy",

  directEmailIntro: "Prefer to email us directly?",

  privacyHeading: "Privacy & delivery",
  privacyNote:
    "When you submit a form, it's processed by our form provider, Formspree, and delivered to The Electric Lavender Train's business email inbox. We use it to respond to your inquiry and handle it as described in our Privacy Policy — we don't sell it or add you to a marketing list.",

  validation: {
    required: (label: string) => `${label} is required.`,
    email: "Enter a valid email address.",
    phone: "Enter a valid phone number using 7 to 15 digits.",
    budget:
      "Enter a non-negative whole-dollar budget without symbols or commas.",
    requiresLetter: (label: string) =>
      `${label} must include at least one letter.`,
    positiveInteger: (label: string) =>
      `${label} must be a whole number greater than zero.`,
    url: "Enter a valid link starting with http:// or https://, or leave this blank.",
    tooLong: (label: string, max: number) =>
      `${label} must be ${max} characters or fewer.`,
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

/** ONE complete development fallback for the `contactPage` singleton, used only when it is entirely absent from a non-production dataset — same convention as every other page singleton's fallback (`homeData.ts`, `aboutData.ts`, `showsData.ts`, `mediaData.ts`). */
export const contactPageFallback = {
  intro: {
    kicker: "Get In Touch",
    heading: "Contact & Booking",
    lede: "Have a question, or want ELT at your event? Start below.",
    explanation:
      "Choose the kind of inquiry below, fill in the details, and send it directly from this page. Prefer email? Use the direct address at the bottom of the form instead.",
  },
  newsletterCta: {
    heading: "Stay in the Loop",
    body: "Get the weekly ELT performance schedule delivered to your inbox.",
    linkLabel: "Join the Newsletter",
  },
  faq: [
    {
      _key: "what-events",
      question: "What kinds of events can ELT play?",
      answer:
        "Electric Lavender Train plays weddings, private parties, breweries, wineries, festivals, and other live events across California's Central Coast. Every event is a little different, so send a booking inquiry with your event details and we'll let you know what's possible.",
    },
    {
      _key: "booking-confirms",
      question: "Does submitting a booking inquiry confirm my date?",
      answer:
        "No. Submitting an inquiry starts a conversation — it does not confirm availability, pricing, or a booking. ELT will follow up by email to confirm whether your date is open.",
    },
    {
      _key: "merch-inquiries",
      question: "How do merchandise inquiries work?",
      answer:
        "Merchandise is available by inquiry only — there's no online store, cart, or checkout on this site. Send a merch inquiry with what you're interested in, and we'll follow up with availability and details.",
    },
    {
      _key: "upcoming-shows",
      question: "Where can I find upcoming public shows?",
      answer:
        "Public dates are listed on the Shows page as soon as they're confirmed. A date that isn't listed there isn't guaranteed to be open — send a booking inquiry and ELT will confirm.",
    },
  ],
  seo: {
    metaTitle: "Contact & Booking",
    metaDescription:
      "Contact Electric Lavender Train for booking, merchandise, and general inquiries.",
  },
};

export default contactCopy;
