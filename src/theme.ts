import { createTheme, Shadows } from "@mui/material/styles";

/**
 * Ombor Design System — direction "Bukhara Teal".
 * Values come from the Claude Design handoff bundle (tokens.css, MUI mapping
 * section). Do not invent values here; extend only from the design tokens.
 */

const UI_FONT_FAMILY = '"Onest", system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Single mechanism for money/quantity display: tabular figures on the theme
 * font (Onest, per tokens.css — numerics are not monospace). Apply via `sx`
 * on any numeric cell or value (plain object so it can also be spread into
 * composed `sx` values).
 */
export const numericSx = {
	fontVariantNumeric: "tabular-nums",
} as const;

/**
 * Design-token values used by components where the MUI palette has no slot
 * (verbatim from the handoff bundle's tokens.css — do not invent values).
 * Components import these from the theme instead of inlining hex.
 */
export const designTokens = {
	gray25: "#F8FAFA", // --gray-25, zebra / subtle fill
	gray50: "#F1F4F3", // --gray-50, app canvas / hover fill
	gray100: "#E8ECEB", // --gray-100, segmented-control track
	gray200: "#E1E8E6", // --gray-200, default border
	gray300: "#CDD6D5", // --gray-300, strong border / input outline
	gray400: "#A7B2B1", // --gray-400, disabled text / hover border
	gray500: "#7E8A89", // --gray-500, badge text
	gray600: "#5E6E6E", // --gray-600, secondary text
	gray700: "#3E4A4A", // --gray-700, toggle label
	saffron600: "#B5710F", // --saffron-600, archive action icon
	saffron700: "#8F5A0C", // --saffron-700, archive action text
	accentSoft: "#FBF0DC", // --accent-soft
	primaryLine: "#C3DEDE", // --primary-line, hairline on tinted surfaces
	primarySoft: "#E1EEEE", // --primary-soft
	warningBg: "#FBF0DC", // --warning-bg, dialog icon tile
	errorBg: "#FBEAE8", // --error-bg, danger button hover fill
	errorBorder: "#EFC9C4", // --error-border, danger button outline
	successBg: "#E5F2EC", // --success-bg, income / cash-wallet tint
	infoBg: "#E7F0F6", // --info-bg, bank-wallet tint
	successBorder: "#C2E0D2", // --success-border, income badge outline
	infoBorder: "#C5DBEA", // --info-border, deposit badge outline
	saffronBadgeBorder: "#ECD3A4", // saffron badge outline (withdrawal)
	purpleBg: "#ECE7F7", // payroll badge fill
	purpleText: "#6A4BB0", // payroll badge text
	purpleBorder: "#D6CBEE", // payroll badge outline
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
			disabled: "#A7B2B1", // --text-faint
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
		MuiOutlinedInput: {
			styleOverrides: {
				// tokens.css small controls (--tinput, .search-box, .sdrop-trig) are
				// uniformly 40px tall.
				root: {
					"&.MuiInputBase-sizeSmall": { minHeight: 40 },
				},
			},
		},
	},
});

export default theme;
