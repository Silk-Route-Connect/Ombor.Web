import { designTokens, radius } from "theme";

import type { SxProps, Theme } from "@mui/material";

export const SIDEBAR_WIDTH = 248; // expanded column
export const RAIL_WIDTH = 72; // collapsed icon rail
export const NAV_ICON = 22; // nav + footer icon size (expanded and rail)
export const NAV_CHEVRON = 18; // parent expand/collapse chevron

/**
 * The theme's focus ring is teal, which disappears on the teal panel — every
 * control on it gets the white ring instead (one visible focus indicator).
 */
const NAV_FOCUS = {
	"&.Mui-focusVisible": { outline: "2px solid", outlineColor: "common.white", outlineOffset: -2 },
} as const;

/** Text colour of a nav entry: white when it is (or holds) the current page, muted otherwise. */
const navColor = (emphasized: boolean) => (emphasized ? "common.white" : designTokens.onDarkMuted);

/**
 * The one «you are here» look — the open page's row, at any level: a lighter
 * fill, white text and the saffron keystone bar inside the row's left edge
 * (inside — a group's `Collapse` clips anything drawn beyond the row).
 */
const selectedSx = {
	bgcolor: designTokens.onDarkFill,
	"&::before": {
		content: '""',
		position: "absolute",
		left: 4,
		top: 10,
		bottom: 10,
		width: 3,
		borderRadius: `${radius.pill}px`,
		bgcolor: "secondary.main",
	},
};

/**
 * A top-level row (with icon) on the expanded panel; also the footer rows.
 * `selected` — this row IS the open page; `emphasized` — a group holding it.
 * A group that is merely expanded stays muted, so only one place reads as current.
 */
export const topLevelItemSx = (selected: boolean, emphasized = selected): SxProps<Theme> => ({
	position: "relative",
	borderRadius: `${radius.md}px`,
	px: 1.25,
	py: 1.125,
	gap: 1.375,
	color: navColor(emphasized),
	...(selected && selectedSx),
	"&:hover": {
		bgcolor: selected ? designTokens.onDarkFill : designTokens.onDarkHover,
		color: "common.white",
	},
	...NAV_FOCUS,
});

/** A child row under an expanded group. */
export const subItemSx = (selected: boolean): SxProps<Theme> => ({
	position: "relative",
	borderRadius: `${radius.md}px`,
	py: 1,
	pr: 1.25,
	pl: 4.125,
	color: navColor(selected),
	...(selected && selectedSx),
	"&:hover": {
		bgcolor: selected ? designTokens.onDarkFill : designTokens.onDarkHover,
		color: "common.white",
	},
	...NAV_FOCUS,
});

/** Icon-only rail button (collapsed panel). */
export const railButtonSx = (selected: boolean): SxProps<Theme> => ({
	position: "relative",
	width: 44,
	height: 42,
	minWidth: 0,
	mx: "auto",
	p: 0,
	borderRadius: `${radius.md}px`,
	justifyContent: "center",
	color: navColor(selected),
	...(selected && selectedSx),
	"&:hover": {
		bgcolor: selected ? designTokens.onDarkFill : designTokens.onDarkHover,
		color: "common.white",
	},
	...NAV_FOCUS,
});

/** Label weight of a nav entry. */
export const navLabelSx = (emphasized: boolean) =>
	({ fontSize: 14, fontWeight: emphasized ? 600 : 500 }) as const;

/** The panel itself. */
export const asideSx = (expanded: boolean): SxProps<Theme> => ({
	width: expanded ? SIDEBAR_WIDTH : RAIL_WIDTH,
	flexShrink: 0,
	height: "100%",
	display: "flex",
	flexDirection: "column",
	bgcolor: designTokens.navBg,
	color: "common.white",
	px: 1.5,
	py: 1.75,
	overflow: "hidden",
	colorScheme: "dark",
	transition: (theme) =>
		theme.transitions.create("width", {
			duration: 260,
			easing: theme.transitions.easing.easeInOut,
		}),
});

/** Spacing between nav rows (the bundle's .nav/.nav-sub 1px rhythm). */
export const navListSx = { "& .MuiListItemButton-root": { mb: "1px" } } as const;
