import { radius } from "theme";

/** The surface of every New Sale / Supply / Order card. */
export const posCardSx = {
	bgcolor: "background.paper",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: `${radius.lg}px`,
	boxShadow: 1,
} as const;

/** Inner padding of a POS card block (header row, fields, summary sections). */
export const POS_CARD_PADDING = "16px 20px";

/** The POS page: the work column and the 360px summary rail beside it from `lg`. */
export const posGridSx = {
	display: "grid",
	gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
	alignItems: "start",
	gap: "20px",
} as const;

/** The work column's stack of cards. */
export const posColumnSx = {
	display: "flex",
	flexDirection: "column",
	gap: "16px",
	minWidth: 0,
} as const;

/** The sticky summary rail card. */
export const posSummaryCardSx = {
	...posCardSx,
	position: "sticky",
	top: 16,
	overflow: "hidden",
} as const;

/** A line's unit-price field: «× 12 500 000 UZS» fits without scrolling the figure. */
export const LINE_PRICE_WIDTH = 172;

/** Where a line's controls start below their 16px caption + 6px gap — for the caption-less remove button. */
export const LINE_CONTROL_OFFSET = "22px";

/** The page's commit button — the one hero-sized control of the summary rail. */
export const posSubmitSx = { height: 50, fontSize: 15 } as const;
