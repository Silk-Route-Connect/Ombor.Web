/** A link-looking text button inside the summary («изменить», «Вся сумма») — keyboard-reachable, theme focus ring. */
export const summaryTextButtonSx = {
	p: 0,
	font: "inherit",
	fontWeight: 600,
	color: "primary.main",
	verticalAlign: "baseline",
	"&:hover": { textDecoration: "underline" },
} as const;
