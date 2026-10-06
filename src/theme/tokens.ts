/**
 * Tabular lining figures on the theme font (Onest — numerics are not monospace).
 * Spread into the `sx` of any money / quantity / tabular cell or value.
 */
export const numericSx = {
	fontVariantNumeric: "tabular-nums lining-nums",
} as const;

/** Radius scale. `md` is also `shape.borderRadius`. */
export const radius = {
	xs: 4, // chips inside dense cells
	sm: 6, // small buttons, tooltips
	md: 8, // DEFAULT — buttons / inputs / menus
	lg: 12, // cards / modals
	xl: 16, // large cards / data-table container
	pill: 999, // chips / pills
} as const;

/**
 * Interactive-control heights — one source so a header/filter row of mixed
 * controls (buttons, inputs, search, selects, segmented) aligns at one height.
 * Inputs use MUI `size="small"`, which the theme maps to `md` (38px).
 */
export const controlSize = {
	md: { height: 38, fontSize: 14, paddingX: 16, paddingY: 9 },
	sm: { height: 31, fontSize: 13, paddingX: 12 },
} as const;

/**
 * Modal widths — three sizes only. Paper radius and margins come from the theme
 * (`MuiDialog`); pass the width through `dialogPaperSx`.
 */
export const dialogWidth = {
	sm: 480, // confirmations, short forms
	md: 640, // standard forms
	lg: 880, // line-item editors (orders, refunds, templates, opening stock)
} as const;

export type DialogSize = keyof typeof dialogWidth;

/** Paper `sx` for a modal of the given size (fits narrow screens with a 16px gutter). */
export const dialogPaperSx = (size: DialogSize) =>
	({ width: dialogWidth[size], maxWidth: "calc(100% - 32px)", m: 2 }) as const;

/**
 * Numeric type steps that have no MUI variant home (KPI / balance values). All
 * carry tabular lining figures. Weights stop at 700 — Onest 800 is not loaded.
 */
export const typeScale = {
	display: { fontSize: 34, lineHeight: "40px", fontWeight: 700, letterSpacing: "-0.025em" },
	numHero: {
		fontSize: 32,
		fontWeight: 700,
		letterSpacing: "-0.02em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // KPI / balance headline
	numStrong: {
		fontSize: 26,
		fontWeight: 700,
		letterSpacing: "-0.02em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // KPI card value
	numTable: {
		fontSize: 15,
		fontWeight: 600,
		letterSpacing: "-0.01em",
		fontVariantNumeric: "tabular-nums lining-nums",
	}, // headline money cell
} as const;
