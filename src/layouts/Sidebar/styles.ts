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

/** Text colour of a nav entry: white when it is the current place, muted otherwise. */
const navColor = (emphasized: boolean) => (emphasized ? "common.white" : designTokens.onDarkMuted);

/** A top-level row (with icon) on the expanded panel; also the footer rows. */
export const topLevelItemSx = (emphasized: boolean): SxProps<Theme> => ({
	borderRadius: `${radius.md}px`,
	px: 1.25,
	py: 1.125,
	gap: 1.375,
	color: navColor(emphasized),
	"&:hover": { bgcolor: designTokens.onDarkHover, color: "common.white" },
	...NAV_FOCUS,
});

/**
 * A child row: the active page gets the white text, a lighter fill and the
 * saffron keystone bar — the brand accent marks «you are here».
 */
export const subItemSx = (active: boolean): SxProps<Theme> => ({
	position: "relative",
	borderRadius: `${radius.md}px`,
	py: 1,
	pr: 1.25,
	pl: 4.125,
	color: navColor(active),
	bgcolor: active ? designTokens.onDarkFill : "transparent",
	"&::before": active
		? {
				content: '""',
				position: "absolute",
				left: 14,
				top: 10,
				bottom: 10,
				width: 3,
				borderRadius: `${radius.pill}px`,
				bgcolor: "secondary.main",
			}
		: undefined,
	"&:hover": {
		bgcolor: active ? designTokens.onDarkFill : designTokens.onDarkHover,
		color: "common.white",
	},
	...NAV_FOCUS,
});

/** Icon-only rail button (collapsed panel). */
export const railButtonSx = (active: boolean): SxProps<Theme> => ({
	width: 44,
	height: 42,
	minWidth: 0,
	mx: "auto",
	p: 0,
	borderRadius: `${radius.md}px`,
	justifyContent: "center",
	color: navColor(active),
	bgcolor: active ? designTokens.onDarkFill : "transparent",
	"&:hover": {
		bgcolor: active ? designTokens.onDarkFill : designTokens.onDarkHover,
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
