import {
	DANGER_FG,
	designTokens,
	INFO_FG,
	NEUTRAL,
	SUCCESS_FG,
	TEAL_500,
	WARNING_FG,
} from "./palette";

export interface ChipToken {
	variant: "soft" | "outline";
	bg: string;
	color: string;
	border: string;
}

const soft = (bg: string, color: string, border: string): ChipToken => ({
	variant: "soft",
	bg,
	color,
	border,
});

const outline = (color: string, border: string): ChipToken => ({
	variant: "outline",
	bg: "transparent",
	color,
	border,
});

const TEAL = soft(designTokens.primarySoft, TEAL_500, designTokens.primaryLine);
const SAFFRON = soft(designTokens.accentSoft, designTokens.saffron700, designTokens.saffron100);
const INFO = soft(designTokens.infoBg, INFO_FG, designTokens.infoBorder);
const WARNING = soft(designTokens.warningBg, WARNING_FG, designTokens.warningBorder);
const DANGER = soft(designTokens.errorBg, DANGER_FG, designTokens.errorBorder);
const SUCCESS = soft(designTokens.successBg, SUCCESS_FG, designTokens.successBorder);
const NEUTRAL_CHIP = soft(NEUTRAL[100], NEUTRAL[700], NEUTRAL[300]);
const PURPLE = soft(designTokens.purpleBg, designTokens.purpleText, designTokens.purpleBorder);

/**
 * Chip / badge colour semantics — the only place chip colours are defined. Every
 * pill renders through the shared `StatusPill`, keyed by one of these names.
 * Text is the darker on-tint shade of each family (all ≥5:1 on its own fill).
 *
 * Axes (ui-patterns «Chip colour semantics»):
 * - transaction TYPE — brand hues: Sale = teal, Supply = saffron, refunds outlined;
 * - payment STATUS — Open = info blue, PartiallyPaid = amber, Overdue = red,
 *   Closed = green, on every surface;
 * - money DIRECTION — income green, expense red;
 * - stock movement kinds other than Sale/Supply are neutral (icon carries the kind);
 * - generic families (info / warning / success / danger / neutral / purple) for
 *   module states that are not one of the axes above.
 */
export const chipTokens = {
	sale: TEAL,
	supply: SAFFRON,
	saleRefund: outline(TEAL_500, designTokens.primaryLine),
	supplyRefund: outline(designTokens.saffron700, designTokens.saffron100),

	open: INFO,
	partiallyPaid: WARNING,
	overdue: DANGER,
	closed: SUCCESS,

	income: SUCCESS,
	expense: DANGER,

	// Stock-adjustment direction (stock, not money — so not green/red).
	stockIn: INFO,
	stockOut: WARNING,

	neutral: NEUTRAL_CHIP,
	teal: TEAL,
	saffron: SAFFRON,
	info: INFO,
	warning: WARNING,
	success: SUCCESS,
	danger: DANGER,
	dangerOutline: outline(DANGER_FG, designTokens.errorBorder),
	purple: PURPLE,
} as const satisfies Record<string, ChipToken>;

export type ChipTokenKey = keyof typeof chipTokens;
