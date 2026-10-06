import type React from "react";

/**
 * Props that make a non-table row (a rail list item) open like a table row: by
 * click, Enter or Space, focusable in tab order. Keys pressed on a link or
 * button inside the row stay with that control.
 */
export const clickableRowProps = (onOpen: () => void) => ({
	tabIndex: 0,
	onClick: onOpen,
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			onOpen();
		}
	},
});
