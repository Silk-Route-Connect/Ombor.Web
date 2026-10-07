/**
 * Tabular lining figures on the theme font (Onest — numerics are not monospace).
 * Only for figures read in a column or compared by size: money, quantities,
 * totals, KPI and hero values. Identifiers and dates use `figuresSx`.
 */
export const numericSx = {
	fontVariantNumeric: "tabular-nums lining-nums",
} as const;

/**
 * Proportional lining figures — dates, times, document numbers, phones and SKUs.
 * Onest's tabular «1» is 85% wider than its proportional one, so tabular figures
 * opened gaps in «11.07.2026 21:20» and «№411» that read as a different font.
 */
export const figuresSx = {
	fontVariantNumeric: "proportional-nums lining-nums",
} as const;

/** Radius scale. `md` is also `shape.borderRadius`. */
export const radius = {
	xs: 4, // keycaps, legend swatches, checkboxes
	sm: 6, // segmented-control items, stepper buttons, tooltips
	md: 8, // DEFAULT — buttons / inputs / menus
	lg: 12, // cards / modals
	xl: 16, // large hero surfaces (auth card)
	pill: 999, // chips / pills
} as const;

/**
 * Icon sizes by role — one step per role so the same glyph reads the same size
 * everywhere. Button start/end icons come from the theme (`MuiButton`): md, and
 * sm on small buttons.
 */
export const iconSize = {
	xs: 14, // inline hint beside a label or figure (ⓘ, delta arrows)
	sm: 16, // table cell, chip, caption / meta row, card-footer link
	md: 18, // button & input adornment, card-header icon
	lg: 20, // back button, header icon buttons, menu item (MUI `fontSize="small"`)
	xl: 22, // dialog / confirmation tile
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

/**
 * Page layout. `contentMax` caps the content column on very wide screens (at
 * 2560px a label and its amount sat ~1900px apart); at 1920 and below it
 * changes nothing.
 */
export const layout = {
	contentMax: 1600,
	/** The app header's height — a modal clears it while the header shows the connection status. */
	topbarHeight: 60,
	/** CSS variable holding the sidebar's current width (set by the sidebar; toasts sit past it). */
	sidebarWidthVar: "--app-sidebar-width",
} as const;

/**
 * Paper `sx` keeping a modal below the app header — while the header's connection
 * status sits above the modal layer, a tall modal would otherwise run under it.
 * (MUI caps a modal at the viewport less 64px; this caps it below the header.)
 * A modal already open when a problem shows glides down instead of jumping.
 */
export const dialogBelowHeaderSx = {
	mt: `${layout.topbarHeight + 16}px`,
	maxHeight: `calc(100% - ${layout.topbarHeight + 16 + 32}px)`,
	transition: "margin-top .2s ease, max-height .2s ease",
	"@media (prefers-reduced-motion: reduce)": { transition: "none" },
} as const;
