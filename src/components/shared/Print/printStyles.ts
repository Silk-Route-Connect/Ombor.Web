import { designTokens, numericSx } from "theme";

/** Page margin of every printed document — the `@page` rule and the on-screen sheet padding. */
export const PRINT_PAGE_MARGIN = "12mm";

/** The one rule colour on paper: table grid, signature lines, header divider. */
export const PRINT_RULE_COLOR = designTokens.borderControl;

/** Small uppercase caption above a block («Отправитель», «Получатель»). */
export const printCaptionSx = {
	fontSize: 11,
	fontWeight: 600,
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	color: "text.secondary",
} as const;

/** Money and quantities on paper: tabular figures that never wrap. */
export const printNumberSx = { ...numericSx, whiteSpace: "nowrap" } as const;

/**
 * The A4 sheet: a paper preview on screen, and on paper just the content —
 * the `@page` margin replaces the padding and the frame disappears.
 */
export const printSheetSx = {
	width: "210mm",
	minHeight: "297mm",
	mx: "auto",
	p: PRINT_PAGE_MARGIN,
	boxSizing: "border-box",
	bgcolor: "background.paper",
	color: "text.primary",
	border: "1px solid",
	borderColor: "divider",
	boxShadow: 2,
	fontSize: 13,
	lineHeight: 1.45,
	"@media print": {
		width: "auto",
		minHeight: 0,
		p: 0,
		border: 0,
		boxShadow: "none",
	},
} as const;

/** A landscape A4 sheet (laid over {@link printSheetSx}) for a table too wide for portrait. */
export const printSheetLandscapeSx = {
	width: "297mm",
	minHeight: "210mm",
	"@media print": { width: "auto", minHeight: 0 },
} as const;
