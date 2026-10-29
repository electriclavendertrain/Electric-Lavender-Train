/**
 * Progressive inquiry tabs and accessible validation. The first valid
 * submission remains a native navigation; only invalid or duplicate submits
 * are prevented. Native HTML validation remains available without JavaScript.
 *
 * After a valid submission, returning to this page with the browser's Back
 * button (including Formspree's "Go back" link) clears that form, so a
 * finished inquiry is not left filled in. This runs only with JavaScript.
 */

import { contactCopy } from "../data/contactData";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[0-9() .-]+$/;
const WHOLE_DOLLAR_PATTERN = /^\d+$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;
/** Requires at least one Unicode letter while allowing other name characters. */
const REQUIRES_LETTER_PATTERN = /\p{L}/u;
const MAX_ITEM_PARAM_LENGTH = 200;
const ALLOWED_INQUIRIES = ["booking", "merch", "other", "removal"];

// ARIA tabs are activated only after this script can control every panel.
const switcher = document.querySelector<HTMLElement>("[data-inquiry-switcher]");
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-inquiry-tab]"));
const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-inquiry-panel]"));

function normalizeInquiry(value: string | null): string {
  return value && ALLOWED_INQUIRIES.includes(value) ? value : "booking";
}

function selectInquiry(value: string, options: { focus?: boolean; updateUrl?: boolean } = {}) {
  for (const tab of tabs) {
    const isSelected = tab.dataset.inquiryTab === value;
    tab.setAttribute("aria-selected", isSelected ? "true" : "false");
    tab.tabIndex = isSelected ? 0 : -1;
    if (isSelected && options.focus) tab.focus();
  }
  for (const panel of panels) {
    panel.hidden = panel.dataset.inquiryPanel !== value;
  }
  if (options.updateUrl !== false) {
    const url = new URL(window.location.href);
    url.searchParams.set("inquiry", value);
    window.history.replaceState(null, "", url);
  }
}

if (switcher && tabs.length > 0 && panels.length > 0) {
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      const value = tab.dataset.inquiryTab;
      if (value) selectInquiry(value);
    });
  }

  switcher.addEventListener("keydown", (event) => {
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const value = tabs[nextIndex].dataset.inquiryTab;
      if (value) selectInquiry(value, { focus: true });
    }
  });

  switcher.classList.add("is-active");

  // An invalid or missing query value defaults to Booking without rewriting the URL.
  const initialParams = new URLSearchParams(window.location.search);
  selectInquiry(normalizeInquiry(initialParams.get("inquiry")), { updateUrl: false });

  applyMerchItemPrefill();
}

/** Treats the merch prefill as capped plain text, never HTML or a record lookup. */
function applyMerchItemPrefill() {
  const itemParam = new URLSearchParams(window.location.search).get("item");
  if (!itemParam) return;
  const merchItemField = document.querySelector<HTMLInputElement>("[data-merch-item-field]");
  if (merchItemField) {
    const cap = merchItemField.maxLength > 0 ? merchItemField.maxLength : MAX_ITEM_PARAM_LENGTH;
    merchItemField.value = itemParam.slice(0, cap);
  }
}

/** Validates fields without logging their values and returns the first error. */
function validateForm(form: HTMLFormElement): HTMLElement | null {
  let firstInvalid: HTMLElement | null = null;

  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-field]"),
  );

  for (const field of fields) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const label = field.dataset.label ?? field.name;
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = contactCopy.validation.required(label);
    } else if (field instanceof HTMLInputElement && field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
      message = contactCopy.validation.email;
    } else if (field.dataset.validationKind === "phone" && value) {
      const digitCount = value.replace(/\D/g, "").length;
      if (!PHONE_CHARACTERS_PATTERN.test(value) || digitCount < 7 || digitCount > 15) {
        message = contactCopy.validation.phone;
      }
    } else if (field.dataset.validationKind === "budget" && value) {
      const amount = Number(value);
      if (!WHOLE_DOLLAR_PATTERN.test(value) || !Number.isSafeInteger(amount) || amount < 0) {
        message = contactCopy.validation.budget;
      }
    } else if (field.dataset.validationKind === "requiresLetter" && value) {
      if (!REQUIRES_LETTER_PATTERN.test(value)) {
        message = contactCopy.validation.requiresLetter(label);
      }
    } else if (field.dataset.validationKind === "positiveInteger" && value) {
      const amount = Number(value);
      if (!WHOLE_NUMBER_PATTERN.test(value) || !Number.isSafeInteger(amount) || amount <= 0) {
        message = contactCopy.validation.positiveInteger(label);
      }
    } else if (field.dataset.validationKind === "url" && value) {
      // Syntax only; this does not fetch the URL or restrict its host.
      let isValidHttpUrl = false;
      try {
        isValidHttpUrl = ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        isValidHttpUrl = false;
      }
      if (!isValidHttpUrl) {
        message = contactCopy.validation.url;
      }
    }

    // Length validation also applies to fields with a format rule.
    if (!message && !(field instanceof HTMLSelectElement) && field.maxLength >= 0 && value.length > field.maxLength) {
      message = contactCopy.validation.tooLong(label, field.maxLength);
    }

    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
      if (!firstInvalid) firstInvalid = field;
    } else {
      field.removeAttribute("aria-invalid");
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }
    }
  }

  return firstInvalid;
}

const forms = Array.from(document.querySelectorAll<HTMLFormElement>("[data-inquiry-form]"));

/**
 * Per-tab marker for a form that was validly submitted. Session storage
 * survives the trip to Formspree and back, but not a new tab or browser
 * session. Storage can be unavailable (private modes, blocked site data), in
 * which case the form simply keeps the browser's normal Back behavior.
 */
const SUBMITTED_KEY_PREFIX = "elt-inquiry-submitted:";

function markSubmitted(inquiry: string) {
  try {
    window.sessionStorage.setItem(SUBMITTED_KEY_PREFIX + inquiry, "1");
  } catch {
    /* Storage unavailable: keep the browser's default Back behavior. */
  }
}

function takeSubmittedMark(inquiry: string): boolean {
  try {
    const key = SUBMITTED_KEY_PREFIX + inquiry;
    const wasSubmitted = window.sessionStorage.getItem(key) === "1";
    if (wasSubmitted) window.sessionStorage.removeItem(key);
    return wasSubmitted;
  } catch {
    return false;
  }
}

/** Clears a form's values and any visible validation errors. */
function clearForm(form: HTMLFormElement) {
  form.reset();
  for (const field of Array.from(form.querySelectorAll<HTMLElement>("[data-field]"))) {
    field.removeAttribute("aria-invalid");
    const errorEl = document.getElementById(`${field.id}-error`);
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  }
}

/**
 * Runs when the page is shown, including a Back-button return. A restored
 * page (bfcache) also gets its pending submit button reset. Browsers can
 * restore typed values with or without bfcache, so a submitted form is
 * cleared in both cases.
 */
const resetPendingState: Array<() => void> = [];
const clearSubmittedForms: Array<() => boolean> = [];
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    for (const reset of resetPendingState) reset();
  }
  let clearedAny = false;
  for (const clear of clearSubmittedForms) {
    if (clear()) clearedAny = true;
  }
  // `form.reset()` also clears the merch field, so restore any ?item= prefill.
  if (clearedAny) applyMerchItemPrefill();
});

for (const form of forms) {
  const deliveryConfigured = form.dataset.deliveryConfigured === "true";

  // getAttribute returns null for an omitted action; form.action would not.
  const endpoint = form.getAttribute("action");

  // Never enhance a form that has no verified delivery endpoint.
  if (!deliveryConfigured || !endpoint) continue;

  // Custom validation replaces native prompts only on configured forms.
  form.setAttribute("novalidate", "");

  const submitButton = form.querySelector<HTMLButtonElement>("[data-inquiry-submit]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const inquiry = form.dataset.inquiryForm ?? "";
  let submitting = false;

  clearSubmittedForms.push(() => {
    if (!inquiry || !takeSubmittedMark(inquiry)) return false;
    clearForm(form);
    return true;
  });

  resetPendingState.push(() => {
    submitting = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
    if (submitLabel) submitLabel.textContent = contactCopy.submitLabel;
  });

  form.addEventListener("submit", (event) => {
    const firstInvalid = validateForm(form);
    if (firstInvalid) {
      // Invalid submissions do not enter the pending state.
      event.preventDefault();
      firstInvalid.focus();
      return;
    }

    if (submitting) {
      // Prevent only a repeat submit; the first valid navigation is untouched.
      event.preventDefault();
      return;
    }

    // Preserve native Formspree navigation while showing progress.
    submitting = true;
    if (inquiry) markSubmitted(inquiry);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }
    if (submitLabel) submitLabel.textContent = contactCopy.submittingLabel;
  });
}
