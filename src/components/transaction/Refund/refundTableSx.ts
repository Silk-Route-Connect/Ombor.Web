import { designTokens, numericSx } from "theme";

export const refundHeadCellSx = {
	textAlign: "right",
	fontSize: 11,
	fontWeight: 600,
	color: "text.secondary",
	p: "10px 12px",
	bgcolor: designTokens.gray25,
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
} as const;

export const refundBodyCellSx = {
	textAlign: "right",
	fontSize: 14,
	p: "11px 12px",
	borderBottom: "1px solid",
	borderColor: "divider",
	verticalAlign: "middle",
	...numericSx,
} as const;

/** Muted unit suffix after a quantity. */
export const refundUnitSx = { color: "text.disabled", fontSize: 12 } as const;
