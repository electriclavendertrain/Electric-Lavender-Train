/** Opens member dialogs and dismisses them without moving the document. */

const supportsModalDialog =
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal === "function";

if (supportsModalDialog) {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>("dialog[data-member-dialog]"),
  );
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-member-dialog-open]"),
  );

  if (dialogs.length > 0) {
    document.documentElement.classList.add("js-dialogs");
  }

  const openerByDialog = new WeakMap<HTMLDialogElement, HTMLElement>();

  const openDialog = (dialog: HTMLDialogElement, trigger?: HTMLElement) => {
    if (dialog.open) return;

    // Native dialogs remember the focused opener and focus it again on close.
    // That browser-managed focus return scrolls the page to the member card.
    // Blurring before showModal() prevents the card from becoming that return
    // target, so X and Escape can dismiss the dialog without moving the page.
    if (trigger) {
      openerByDialog.set(dialog, trigger);
      trigger.blur();
    } else {
      openerByDialog.delete(dialog);
    }
    dialog.showModal();
  };

  for (const trigger of triggers) {
    const dialogId = trigger.dataset.memberDialogOpen;
    if (!dialogId) continue;

    const dialog = document.getElementById(dialogId);
    if (!(dialog instanceof HTMLDialogElement)) continue;

    trigger.addEventListener("click", (event) => {
      // Leave modified clicks alone — someone deliberately opening this in a
      // new tab should get the page with the fragment, not a suppressed click.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      openDialog(dialog, trigger);
    });
  }

  for (const dialog of dialogs) {
    for (const control of dialog.querySelectorAll<HTMLElement>(
      "[data-member-dialog-close]",
    )) {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        dialog.close();
      });
    }

    dialog.addEventListener("close", () => {
      const opener = openerByDialog.get(dialog);
      openerByDialog.delete(dialog);

      // Blurring before showModal() prevents Chrome's native focus return from
      // scrolling to the opener. Restore keyboard focus ourselves with page
      // movement explicitly disabled once the dialog has finished closing.
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
      }
    });
  }

  /**
   * Deep links, and the narrow window between the inline class being set and
   * this module running during which a click can still navigate.
   */
  const openFromHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const dialog = document.getElementById(id);
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (!dialog.hasAttribute("data-member-dialog")) return;

    openDialog(dialog);
  };

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
}
