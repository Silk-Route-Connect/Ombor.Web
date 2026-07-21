import { designTokens } from "theme";

/** Micro-label above each cart-line control (qty / price / discount). */
export const fieldLabelSx = {
	fontSize: 10.5,
	fontWeight: 600,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	color: "text.disabled",
} as const;

/** Bordered 36px container for a two-segment cart-line toggle (discount type, qty unit). */
export const segmentedBoxSx = {
	display: "inline-flex",
	height: 36,
	border: "1px solid",
	borderColor: designTokens.gray300,
	borderRadius: "6px",
	overflow: "hidden",
} as const;

/** One segment of a cart-line toggle; selected = soft primary fill. */
export const segmentSx = (selected: boolean) =>
	({
		px: "9px",
		fontSize: 12,
		fontWeight: 600,
		color: selected ? "primary.main" : "text.secondary",
		bgcolor: selected ? designTokens.primarySoft : "background.paper",
	}) as const;
