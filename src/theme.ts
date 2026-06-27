import { createTheme, Shadows } from "@mui/material/styles";

/**
 * Ombor Design System — direction "Bukhara Teal".
 * Values come from the Claude Design handoff bundle (tokens.css — authoritative)
 * and the DSN-1 foundational-components reference page (spec-lock). This file is
 * the single styling source: every hex lives here, components reference tokens —
 * never inline values. Do not invent values; extend only from the design tokens.
 */

const UI_FONT_FAMILY = '"Onest", system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Single mechanism for money/quantity display: tabular lining figures on the
 * theme font (Onest, per tokens.css — numerics are not monospace). Apply via
 * `sx` on any numeric/money/tabular cell or value (plain object so it can also
 * be spread into composed `sx` values). Per design-handoff, numbers are the hero.
 */
export const numericSx = {
	fontVariantNumeric: "tabular-nums lining-nums",
} as const;

/**
 * Core hues — single source for both the MUI palette and the chip tokens below
 * (so the two never drift). Names mirror tokens.css custom properties.
 */
const TEAL_500 = "#12676B"; // --teal-500, PRIMARY
const TEAL_600 = "#0D5256"; // --teal-600, hover / pressed
const SAFFRON_500 = "#D88A1E"; // --saffron-500, ACCENT
const SUCCESS = "#17835A"; // --success
const WARNING = "#C57E14"; // --warning
const ERROR = "#C53D31"; // --error
const INFO = "#2A6F97"; // --info
const INK = "#1C2625"; // --fg-1, primary text / ink (cool, per the Design System)

/**
 * Design-token values used by components where the MUI palette has no slot
 * (verbatim from tokens.css — do not invent values). Components import these
 * from the theme instead of inlining hex.
 */
export const designTokens = {
	// Neutral ramp — warm "Stone" per the Design System (colors_and_type.css).
	// Surfaces / borders / decoration are warm stone; the text steps (gray-500/600,
	// gray-900) stay COOL, matching the DS's cool `--fg-*` text tokens — the DS is
	// warm paper + cool ink, not a single warm ramp. Do not warm the text steps.
	gray0: "#FFFFFF", // --stone-0, surface
	gray25: "#FAF8F4", // --bg-subtle (--stone-50), zebra / subtle fill
	gray50: "#F4F1EA", // --bg-page (--stone-100), app canvas
	gray100: "#ECE8DF", // --divider, light track / in-body row divider
	gray200: "#E4DFD5", // --border, default hairline
	gray300: "#D4CDBF", // --border-strong, strong border / input outline
	gray400: "#B8AF9F", // --stone-400, DECORATION / disabled — never data text
	gray500: "#87908E", // --fg-3, tertiary text (kept cool)
	gray600: "#565F5E", // --fg-2, secondary / muted text (kept cool)
	gray700: "#3E4A4A", // text-tier neutral, kept cool (no DS token between fg-1/fg-2)
	gray800: "#28302F", // text-tier neutral, kept cool (no DS token)
	gray900: INK, // --fg-1, ink (cool)
	// data-bearing secondary text — AA ≥4.5:1 on #FFFFFF / #FAF8F4 (≈6:1).
	// Use for any READABLE secondary string: SKU, dates, №, meta. gray-400 is
	// decoration only; gray-600 (= this token) or darker for data text.
	textSecondary: "#565F5E", // --fg-2 (= --gray-600), cool secondary text
	// saffron (accent) ramp
	saffron100: "#F6DEAE", // --saffron-100, supply / supply-refund chip border
	saffron600: "#B5710F", // --saffron-600, archive action icon
	saffron700: "#8F5A0C", // --saffron-700, archive action text / supply chip text
	accentSoft: "#FBF0DC", // --accent-soft (= --saffron-50), supply chip fill
	// primary tints
	primaryLine: "#C3DEDE", // --primary-line, hairline on tinted surfaces
	primarySoft: "#E1EEEE", // --primary-soft, selected row / active nav / sale chip fill
	// semantic tints (soft chip fills + outlines)
	warningBg: "#FBF0DC", // --warning-bg, dialog icon tile / warning chip fill
	warningBorder: "#EDD3A4", // --warning-border, warning chip outline
	errorBg: "#FBEAE8", // --error-bg, danger button hover fill / error chip fill
	errorBorder: "#EFC9C4", // --error-border, danger button outline / error chip
	successBg: "#E5F2EC", // --success-bg, income / cash-wallet tint
	successBorder: "#C2E0D2", // --success-border, income badge outline
	infoBg: "#E7F0F6", // --info-bg, bank-wallet tint
	infoBorder: "#C5DBEA", // --info-border, deposit badge outline
	saffronBadgeBorder: "#ECD3A4", // saffron badge outline (withdrawal — kept; legacy Payments/Wallets)
	purpleBg: "#ECE7F7", // payroll badge fill (app extension — not in tokens.css)
	purpleText: "#6A4BB0", // payroll badge text
	purpleBorder: "#D6CBEE", // payroll badge outline
	// misc
	focusRing: "0 0 0 3px rgba(18,103,107,.22)", // --focus-ring, input / button focus-visible
} as const;

/**
 * Radius scale (--r-*). Default (--r-md, 8px) is also `shape.borderRadius`;
 * the rest have no MUI slot, so components reference these instead of inlining.
 */
export const radius = {
	xs: 4, // --r-xs, chips inside dense cells
	sm: 6, // --r-sm, inputs / small buttons
	md: 8, // --r-md, DEFAULT — buttons / cards / fields
	lg: 12, // --r-lg, large cards / modals / slide-over
	xl: 16, // --r-xl, cards / data-table container (MUI borderRadius:2)
	pill: 999, // --r-pill, chips / outlined buttons
} as const;

/**
 * Type-scale entries that have no MUI typography variant home — the display
 * headline and the numeric scale (KPI / balance values). All numeric entries
 * carry tabular lining figures. Standard text steps live in `typography` below.
 */
export const typeScale = {
	display: { fontSize: 34, lineHeight: "40px", fontWeight: 800, letterSpacing: "-0.025em" }, // --fs-display
	numHero: {
		fontSize: 32,
		fontWeight: 700,
		letterSpacing: "-0.02em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // --fs-num-hero, KPI / balance headline
	numStrong: {
		fontSize: 26,
		fontWeight: 700,
		letterSpacing: "-0.02em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // --fs-num-strong, KPI card value
	numTable: {
		fontSize: 15,
		fontWeight: 600,
		letterSpacing: "-0.01em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // --fs-num-table, table balance cell
} as const;

/**
 * Chip / badge colour-semantics — locked by the DSN-1 reference sheet. Each
 * entry is the canonical resolved appearance (variant + fill + text + border)
 * so the shared Chip component references these tokens, never inline values.
 * Key rule from the sheet: brand hues (teal/saffron) carry transaction TYPE;
 * green/red are reserved for MONEY (status / direction).
 */
export const chipTokens = {
	// Transaction type — brand hues; refunds are the outlined same-hue variant.
	sale: {
		variant: "soft",
		bg: designTokens.primarySoft,
		color: TEAL_500,
		border: designTokens.primaryLine,
	}, // teal · Sale
	supply: {
		variant: "soft",
		bg: designTokens.accentSoft,
		color: designTokens.saffron700,
		border: designTokens.saffron100,
	}, // saffron · Supply
	saleRefund: {
		variant: "outline",
		bg: "transparent",
		color: TEAL_500,
		border: designTokens.primaryLine,
	}, // teal outline · SaleRefund
	supplyRefund: {
		variant: "outline",
		bg: "transparent",
		color: designTokens.saffron700,
		border: designTokens.saffron100,
	}, // saffron outline · SupplyRefund
	// Transaction payment status — semantic. "Overdue" is the only red here
	// ("усиленный красный" reads as emphasis; tokens.css has a single --error,
	// so it resolves to the error tints — there is no separate intensified red).
	open: { variant: "soft", bg: designTokens.infoBg, color: INFO, border: designTokens.infoBorder }, // Open
	partiallyPaid: {
		variant: "soft",
		bg: designTokens.warningBg,
		color: WARNING,
		border: designTokens.warningBorder,
	}, // PartiallyPaid
	overdue: {
		variant: "soft",
		bg: designTokens.errorBg,
		color: ERROR,
		border: designTokens.errorBorder,
	}, // Overdue
	closed: {
		variant: "soft",
		bg: designTokens.successBg,
		color: SUCCESS,
		border: designTokens.successBorder,
	}, // Closed
	// Direction — income = success, expense = danger.
	income: {
		variant: "soft",
		bg: designTokens.successBg,
		color: SUCCESS,
		border: designTokens.successBorder,
	}, // Income (деньги в кассу)
	expense: {
		variant: "soft",
		bg: designTokens.errorBg,
		color: ERROR,
		border: designTokens.errorBorder,
	}, // Expense (деньги из кассы)
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
			main: TEAL_500, // --teal-500
			dark: TEAL_600, // --teal-600, hover / pressed
			light: designTokens.primarySoft, // --primary-soft
			contrastText: designTokens.gray0,
		},
		secondary: { main: SAFFRON_500 }, // --accent (saffron)
		success: { main: SUCCESS },
		warning: { main: WARNING },
		error: { main: ERROR },
		info: { main: INFO },
		// Warm "Stone" neutral scale (DS colors_and_type.css) — overrides MUI's
		// default cool grey so every `grey.*` reference (and MUI internals)
		// resolves warm. Light steps = warm fills/borders; dark steps = stone.
		grey: {
			50: "#FAF8F4", // --bg-subtle, lightest fill (row / table hover)
			100: "#EFEBE2", // --bg-sunken, track / selected / header fill
			200: "#E9E4DA", // --stone-200, chip bg / heavy hairline
			300: "#DAD3C6", // --stone-300, strong border
			400: "#B8AF9F", // --stone-400, disabled
			500: "#8C8576", // --stone-500
			600: "#5E5849", // --stone-600
			700: "#3D3A30", // --stone-700
			800: "#272620", // --stone-800
			900: "#1A1A16", // --stone-900
		},
		text: {
			primary: INK, // --ink
			secondary: designTokens.textSecondary, // --text-secondary (data-bearing secondary text)
			disabled: designTokens.gray400, // --text-faint (decoration only)
		},
		divider: designTokens.gray200, // --border
		background: {
			default: designTokens.gray50, // --canvas
			paper: designTokens.gray0, // --surface
		},
		action: {
			hover: "rgba(18,103,107,0.04)", // teal wash
			selected: designTokens.primarySoft, // --primary-soft, selected row / active nav tint
		},
	},
	shape: { borderRadius: radius.md }, // --r-md

	shadows,

	typography: {
		fontFamily: UI_FONT_FAMILY, // Onest — all text incl. numerics
		h1: { fontSize: 26, lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.02em" }, // --fs-h1
		h2: { fontSize: 20, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.02em" }, // --fs-h2
		h3: { fontSize: 16, lineHeight: "22px", fontWeight: 600 }, // --fs-h3
		h5: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2 },
		subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.57 },
		body1: { fontSize: 14, lineHeight: "20px" }, // --fs-body
		body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.43 },
		caption: { fontSize: 12, lineHeight: "16px", fontWeight: 400 }, // --fs-caption
		overline: {
			fontSize: 11,
			lineHeight: "16px",
			fontWeight: 700,
			letterSpacing: "0.09em",
			textTransform: "uppercase",
		}, // --fs-overline
		button: { textTransform: "none", fontWeight: 600 },
	},

	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: radius.md,
					fontWeight: 600,
					boxShadow: "none",
					"&:hover": { boxShadow: "none" },
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: { borderColor: designTokens.gray200, fontSize: 14 },
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
