import type { ChipTokenKey } from "theme";
import { designTokens } from "theme";

/** Accent of a stat card's icon tile — a chip family, so tiles and pills share one palette. */
export type StatTone = "neutral" | "primary" | "accent" | "success" | "danger" | "warning" | "info";

export const STAT_TONE_TOKEN: Record<StatTone, ChipTokenKey> = {
	neutral: "neutral",
	primary: "teal",
	accent: "saffron",
	success: "success",
	danger: "danger",
	warning: "warning",
	info: "info",
};

/**
 * A 26–32px figure in a signal shade reads as a traffic light; summary and hero
 * figures draw in the same family's dark on-tint shade — the hue (and so the
 * meaning, pattern 4) is unchanged. Table money, sparklines and icons keep the
 * `.main` shades.
 */
const HERO_SHADE: Record<string, string> = {
	"success.main": "success.dark",
	"error.main": "error.dark",
	// The aging axis is amber; the warning family's dark shade leans olive.
	"warning.main": designTokens.saffron700,
};

/** The colour a big figure is drawn in for a caller's `.main` signal colour. */
export const heroShade = (color: string): string => HERO_SHADE[color] ?? color;
