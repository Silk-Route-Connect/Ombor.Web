import { KeyboardEvent, useCallback } from "react";
import { useStore } from "stores/StoreContext";

export interface FormKeyboardSubmitOptions {
	/**
	 * Commit only on Ctrl / Cmd + Enter, never on a bare Enter. Set for every
	 * immutable money/stock event (payment, payroll, adjustment, transfer, refund,
	 * opening stock): users press Enter after typing a number by habit, and the
	 * event cannot be edited afterwards (commit convention, ui-patterns).
	 */
	requireModifier?: boolean;
	/**
	 * Mirror the footer's `offlineGate` (default on): while the backend is
	 * unreachable the shortcut does nothing, as the disabled submit button does —
	 * otherwise Enter would send the write the gate is there to hold back.
	 */
	offlineGate?: boolean;
}

/**
 * Keyboard submit for the form modals (XC-11). Attach the returned handler to the
 * modal's `<Dialog onKeyDown={…}>`:
 *
 * - **Ctrl / Cmd + Enter** always submits — even from a textarea.
 * - **Enter** submits from a single-line text input — a date / time field's
 *   section (`role=spinbutton`) counts as one — but is left alone inside a
 *   textarea (newline) or while an autocomplete / select popup is open on the
 *   focused input (`aria-expanded="true"` — let it pick the option), and never
 *   fires from a button (the browser already maps Enter to a click there).
 *   With `requireModifier` a bare Enter never submits.
 *
 * `disabled` (pass the form's `isSaving`) suppresses the shortcut while saving,
 * and the offline gate while the backend is unreachable (F-028).
 * IME composition (`isComposing`) is ignored so Enter can commit a candidate.
 */
export function useFormKeyboardSubmit(
	submit: () => unknown,
	disabled = false,
	{ requireModifier = false, offlineGate = true }: FormKeyboardSubmitOptions = {},
) {
	const { connectivityStore } = useStore();

	return useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (disabled || event.key !== "Enter" || event.nativeEvent.isComposing) {
				return;
			}
			if (offlineGate && connectivityStore.isBackendDown) {
				return;
			}
			if (event.metaKey || event.ctrlKey) {
				event.preventDefault();
				void submit();
				return;
			}
			if (requireModifier) {
				return;
			}
			const target = event.target as HTMLElement;
			const singleLine = target.tagName === "INPUT" || target.getAttribute("role") === "spinbutton";
			if (!singleLine || target.getAttribute("aria-expanded") === "true") {
				return;
			}
			event.preventDefault();
			void submit();
		},
		[submit, disabled, requireModifier, offlineGate, connectivityStore],
	);
}

export default useFormKeyboardSubmit;
