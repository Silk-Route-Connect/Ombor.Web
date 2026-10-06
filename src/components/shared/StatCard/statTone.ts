import type { ChipTokenKey } from "theme";

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
