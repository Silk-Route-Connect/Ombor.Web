import { useEffect } from "react";
import { SEARCH_DIALOG_ID } from "components/search/searchGroupMeta";

/**
 * Ctrl+K anywhere opens the global search (⌘K too, for a Mac keyboard). Matched
 * by key position (`KeyK`), so it also works on the Russian layout, where the
 * same key types «л». While another dialog is open the shortcut is left alone:
 * opening a record from the search would drop that dialog's unsaved input
 * (the search's own dialog just keeps the key from the browser).
 */
export function useGlobalSearchHotkey(onOpen: () => void): void {
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.code !== "KeyK" || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) {
				return;
			}
			const dialog = document.querySelector('[role="dialog"]');
			if (dialog && dialog.id !== SEARCH_DIALOG_ID) {
				return;
			}
			e.preventDefault();
			onOpen();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onOpen]);
}
