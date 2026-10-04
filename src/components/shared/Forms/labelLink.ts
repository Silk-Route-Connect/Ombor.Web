/** Set on every `FormFieldLabel`, so a label never claims the control of the label after it. */
const FIELD_LABEL_ATTR = "data-field-label";

const CONTROL_SELECTOR = [
	// A file input is always opened by its own button; a label must not open the file dialog.
	"input:not([type=hidden]):not([type=file]):not([hidden]):not([aria-hidden=true])",
	"textarea:not([aria-hidden=true])",
	"select",
	"[role=combobox]",
	"[role=radiogroup]",
].join(", ");

const LABELABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * The control a field label sits above: the first form control after it inside
 * the label's own container, unless another field label comes first (then the
 * control is that label's). Null for a group heading with no control of its own.
 */
function followingControl(label: HTMLElement): HTMLElement | null {
	const scope = label.parentElement;
	if (!scope) {
		return null;
	}
	const candidates = scope.querySelectorAll<HTMLElement>(
		`${CONTROL_SELECTOR}, [${FIELD_LABEL_ATTR}]`,
	);
	for (const el of candidates) {
		if (!(label.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) {
			continue;
		}
		return el.hasAttribute(FIELD_LABEL_ATTR) ? null : el;
	}
	return null;
}

/**
 * Gives the control below `label` its accessible name (frontend-16). A native
 * input with an id (every MUI TextField / Autocomplete input has one) is linked
 * through the label's `for`, returned here; a MUI Select's combobox or a radio
 * group gets `aria-labelledby` instead — unless it already carries an
 * `aria-label` of its own.
 */
export function linkLabelToControl(label: HTMLElement): string | undefined {
	const control = followingControl(label);
	if (!control) {
		return undefined;
	}
	if (LABELABLE_TAGS.has(control.tagName) && control.id) {
		return control.id;
	}
	if (!control.hasAttribute("aria-label")) {
		const ids = (control.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean);
		if (!ids.includes(label.id)) {
			control.setAttribute("aria-labelledby", [label.id, ...ids].join(" "));
		}
	}
	return undefined;
}
