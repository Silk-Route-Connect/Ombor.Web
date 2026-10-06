/**
 * The caption over a control in a dense line-item row (cart and order lines):
 * 12/600 secondary, sentence case — never an uppercase micro-label. Render it on
 * a `<label htmlFor>` so the control below keeps its accessible name.
 */
export const lineFieldLabelSx = {
	display: "block",
	fontSize: 12,
	lineHeight: "16px",
	fontWeight: 600,
	color: "text.secondary",
} as const;
