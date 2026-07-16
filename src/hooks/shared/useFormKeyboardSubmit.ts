import { KeyboardEvent, useCallback } from "react";

/**
 * Keyboard submit for the form modals (XC-11). Attach the returned handler to the
 * modal's `<Dialog onKeyDown={…}>`:
 *
 * - **Ctrl / Cmd + Enter** always submits — even from a textarea.
 * - **Enter** submits from a single-line text input, but is left alone inside a
 *   textarea (newline) or while an autocomplete / select popup is open on the
 *   focused input (`aria-expanded="true"` — let it pick the option), and never
 *   fires from a button (the browser already maps Enter to a click there).
 *
 * `disabled` (pass the form's `isSaving`) suppresses the shortcut while saving.
 * IME composition (`isComposing`) is ignored so Enter can commit a candidate.
 */
export function useFormKeyboardSubmit(submit: () => void, disabled = false) {
	return useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (disabled || event.key !== "Enter" || event.nativeEvent.isComposing) {
				return;
			}
			if (event.metaKey || event.ctrlKey) {
				event.preventDefault();
				submit();
				return;
			}
			const target = event.target as HTMLElement;
			if (target.tagName !== "INPUT" || target.getAttribute("aria-expanded") === "true") {
				return;
			}
			event.preventDefault();
			submit();
		},
		[submit, disabled],
	);
}

export default useFormKeyboardSubmit;
