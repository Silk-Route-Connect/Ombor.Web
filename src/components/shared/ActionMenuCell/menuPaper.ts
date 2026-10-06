import { radius } from "theme";

/**
 * The one menu surface (DSN-1): hairline, soft elevation, rounded, 4px padded —
 * row / detail ⋮ menus and the topbar menus alike. MUI's default 8px list
 * padding is dropped so the paper padding is the only gap around the items.
 */
export const menuSlotProps = {
	paper: {
		sx: {
			minWidth: 176,
			borderRadius: `${radius.md}px`,
			border: 1,
			borderColor: "divider",
			boxShadow: 8,
			p: 0.5,
		},
	},
	list: { sx: { py: 0 } },
} as const;

/** A menu row: icon + label with one 8px gap, tight padding, the teal hover wash. */
export const menuItemSx = {
	borderRadius: `${radius.sm}px`,
	px: 1.25,
	py: "4px",
	gap: 1,
	fontSize: 14,
	// MUI's MenuItem forces `.MuiListItemIcon-root { min-width: 36px }`, which left
	// ~16px of dead space beside the 20px glyph; the gap above is the only icon↔text space.
	"& .MuiListItemIcon-root": { minWidth: 0 },
	"&:hover": { bgcolor: "action.hover" },
} as const;
