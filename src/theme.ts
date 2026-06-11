import { createTheme, Shadows } from "@mui/material/styles";

/**
 * Ombor Design System — direction "Bukhara Teal".
 * Values come from the Claude Design handoff bundle (tokens.css, MUI mapping
 * section). Do not invent values here; extend only from the design tokens.
 */

const UI_FONT_FAMILY = '"Onest", system-ui, -apple-system, "Segoe UI", sans-serif';
// Canon (docs/design-handoff.md): JetBrains Mono for numeric/tabular data.
const NUMERIC_FONT_FAMILY = '"JetBrains Mono", "Consolas", "Courier New", monospace';

/**
 * Single mechanism for money/quantity display: JetBrains Mono with tabular
 * figures. Apply via `sx` on any numeric cell or value (plain object so it
 * can also be spread into composed `sx` values).
 */
export const numericSx = {
	fontFamily: NUMERIC_FONT_FAMILY,
	fontVariantNumeric: "tabular-nums",
} as const;

// Elevation tokens --e-1/--e-2/--e-3 (border-first, restrained).
const ELEVATION_1 = "0 1px 2px rgba(22,42,43,.05), 0 1px 3px rgba(22,42,43,.06)";
const ELEVATION_2 = "0 2px 6px rgba(22,42,43,.06), 0 6px 16px rgba(22,42,43,.06)";
const ELEVATION_3 = "0 10px 24px rgba(22,42,43,.10), 0 24px 60px rgba(22,42,43,.12)";

const shadows = [...createTheme().shadows] as Shadows;
shadows[1] = ELEVATION_1; // cards, KPI
shadows[8] = ELEVATION_2; // menus, popovers
shadows[16] = ELEVATION_3; // slide-over, modal
shadows[24] = ELEVATION_3; // dialogs

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#12676B", // --teal-500
			dark: "#0D5256", // --teal-600, hover / pressed
			light: "#E1EEEE", // --primary-soft
			contrastText: "#FFFFFF",
		},
		secondary: { main: "#D88A1E" }, // --accent (saffron)
		success: { main: "#17835A" },
		warning: { main: "#C57E14" },
		error: { main: "#C53D31" },
		info: { main: "#2A6F97" },
		text: {
			primary: "#162A2B", // --ink
			secondary: "#5E6E6E", // --text-muted
		},
		divider: "#E1E8E6", // --border
		background: {
			default: "#F1F4F3", // --canvas
			paper: "#FFFFFF", // --surface
		},
		action: {
			hover: "rgba(18,103,107,0.04)",
			selected: "#E1EEEE", // --primary-soft, selected row / active nav tint
		},
	},
	shape: { borderRadius: 8 }, // --r-md

	shadows,

	typography: {
		fontFamily: UI_FONT_FAMILY,
		h1: { fontSize: 26, lineHeight: "32px", fontWeight: 700 },
		h2: { fontSize: 20, lineHeight: "28px", fontWeight: 600 },
		h5: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2 },
		subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.57 },
		body1: { fontSize: 14, lineHeight: "20px" },
		body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.43 },
		button: { textTransform: "none", fontWeight: 600 },
	},

	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 8,
					fontWeight: 600,
					boxShadow: "none",
					"&:hover": { boxShadow: "none" },
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: { borderColor: "#E1E8E6", fontSize: 14 },
			},
		},
	},
});

export default theme;
