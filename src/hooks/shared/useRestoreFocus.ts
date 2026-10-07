import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Returns focus to the element that opened a modal once it closes (`FormDialog`
 * `restoreFocus` — a pencil or button that stays on screen). MUI's own restore
 * lives in its focus trap's effect cleanup, which StrictMode replays on every
 * open in development: focus jumps back to the opener and the modal's
 * `autoFocus` field ends up unfocused. The opener is remembered here instead, in
 * the shell that stays mounted while the modal is closed, so nothing replays.
 */
export function useRestoreFocus(open: boolean, enabled: boolean): void {
	const opener = useRef<HTMLElement | null>(null);

	// A layout effect: it runs before the modal's content mounts (the portal renders
	// it a commit later) and takes focus with its `autoFocus` field.
	useLayoutEffect(() => {
		if (enabled && open) {
			const active = document.activeElement;
			opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
		}
	}, [enabled, open]);

	// A passive effect: by now the closing focus trap has stopped pulling focus back in.
	useEffect(() => {
		if (open) {
			return;
		}
		const target = opener.current;
		opener.current = null;
		if (target?.isConnected) {
			target.focus();
		}
	}, [open]);
}

export default useRestoreFocus;
