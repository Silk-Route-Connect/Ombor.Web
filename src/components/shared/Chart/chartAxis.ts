import { designTokens } from "theme";
import { formatShortNumber } from "utils/formatCurrency";

/** Tick text of every chart axis (dashboard and reports): 11 / 600, secondary ink. */
export const CHART_AXIS_TICK = {
	fontSize: 11,
	fontWeight: 600,
	fill: designTokens.gray600,
} as const;

/** The narrowest value axis — fits «999 тыс». */
const MIN_VALUE_AXIS_WIDTH = 56;
/** Generous per-glyph advance: recharts measures a tick in the page font, not the tick's 11px. */
const TICK_CHAR_WIDTH = 8;
const TICK_GAP = 8;

/**
 * Width of a money value axis that keeps its longest short tick on one line.
 * recharts wraps a tick wider than its axis at the space, so a fixed width broke
 * «−200 тыс» into «−200 / тыс». `values` are the plotted figures; the axis ticks
 * round them, so their short labels are as long as the longest tick.
 */
export function valueAxisWidth(values: readonly number[]): number {
	const longest = values.reduce((len, value) => Math.max(len, formatShortNumber(value).length), 0);
	return Math.max(MIN_VALUE_AXIS_WIDTH, longest * TICK_CHAR_WIDTH + TICK_GAP);
}
