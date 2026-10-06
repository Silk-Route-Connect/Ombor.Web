import { useEffect, useRef } from "react";

interface PosShortcutHandlers {
	submit: () => void;
	leave: () => void;
	/** True while one of the page's own dialogs is open — Esc then belongs to it. */
	dialogOpen: boolean;
}

/**
 * Page-level POS shortcuts: ⌘/Ctrl+Enter submit · Esc leave · Alt+P / Alt+W focus
 * the partner and warehouse pickers (their `data-ns` anchors). One stable window
 * listener reads the latest handlers through a ref.
 */
export function usePosShortcuts(handlers: PosShortcutHandlers): void {
	const latest = useRef(handlers);
	latest.current = handlers;

	useEffect(() => {
		const focus = (selector: string) =>
			(document.querySelector(selector) as HTMLElement | null)?.focus();
		const handler = (e: KeyboardEvent) => {
			// Keys inside a modal (the product form opened from the search) belong to it —
			// its Ctrl+Enter saves the product, never the sale underneath.
			if ((e.target as HTMLElement | null)?.closest?.('[role="dialog"]')) {
				return;
			}
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				latest.current.submit();
			} else if (e.key === "Escape") {
				// Let an open dropdown / dialog consume Esc first.
				if (latest.current.dialogOpen || document.querySelector('[role="listbox"]')) {
					return;
				}
				e.preventDefault();
				latest.current.leave();
			} else if (e.altKey && e.code === "KeyP") {
				e.preventDefault();
				focus('[data-ns="partner"] input');
			} else if (e.altKey && e.code === "KeyW") {
				e.preventDefault();
				focus('[data-ns="warehouse"] [role="combobox"]');
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);
}
