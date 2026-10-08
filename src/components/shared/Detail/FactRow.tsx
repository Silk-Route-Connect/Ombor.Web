import React from "react";
import InfoHint from "components/shared/InfoHint/InfoHint";
import UzsUnit from "components/shared/Money/UzsUnit";
import NoValue from "components/shared/Table/cells/NoValue";
import { figuresSx, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import type { SxProps, Theme } from "@mui/material";
import { Box, Divider } from "@mui/material";

/** `FactList` spaces and divides its rows through this class. */
const FACT_ROW_CLASS = "fact-row";

const FIGURES_SX = { tabular: numericSx, proportional: figuresSx } as const;

export type FactFigures = keyof typeof FIGURES_SX;

export interface FactRowProps {
	label: React.ReactNode;
	/** A 16px glyph before the label, in `text.disabled` unless the icon sets its own colour. */
	icon?: React.ReactNode;
	/** One plain sentence explaining the term («i» after the label). */
	hint?: string;
	/** The value. Empty (`null`, `undefined`, `""`, `false`) renders «—». */
	children?: React.ReactNode;
	/**
	 * A money value in place of `children`: the figure and «UZS». `null` is «—»
	 * (not set); `0` prints «0» and never takes `valueColor` — a zero is not a signal.
	 */
	money?: number | null;
	/** `tabular` for money and quantities, `proportional` for dates, numbers, phones. */
	figures?: FactFigures;
	/** Colour of the value — money semantics stay with the caller (pattern 4). */
	valueColor?: string;
	/** Label above the value — long text (an address, a note) or a grid of facts. */
	stacked?: boolean;
	sx?: SxProps<Theme>;
}

const isEmpty = (node: React.ReactNode) => node == null || node === "" || node === false;

/**
 * The one «label · value» fact of a detail rail or card: label 13px secondary on
 * the left, value 14/500 primary on the right (or below it when `stacked`).
 * Lay rows out in a {@link FactList}, which owns their spacing and hairlines.
 */
export const FactRow: React.FC<FactRowProps> = ({
	label,
	icon,
	hint,
	children,
	money,
	figures,
	valueColor = "text.primary",
	stacked = false,
	sx,
}) => {
	const isMoney = money !== undefined;
	let value: React.ReactNode;
	if (isMoney) {
		value =
			money == null ? (
				<NoValue />
			) : (
				<>
					{formatCurrency(money)}
					<UzsUnit />
				</>
			);
	} else {
		value = isEmpty(children) ? <NoValue /> : children;
	}
	const neutral = isMoney && !money;
	const valueFigures = isMoney ? "tabular" : figures;

	return (
		<Box
			className={FACT_ROW_CLASS}
			sx={[
				{
					display: "flex",
					flexDirection: stacked ? "column" : "row",
					alignItems: stacked ? "stretch" : "center",
					justifyContent: stacked ? "flex-start" : "space-between",
					gap: stacked ? "4px" : "16px",
					py: "11px",
					minWidth: 0,
				},
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "8px",
					typography: "body2",
					color: "text.secondary",
					flex: stacked ? undefined : "0 1 auto",
					minWidth: 0,
				}}
			>
				{icon && (
					<Box
						component="span"
						aria-hidden
						sx={{
							display: "inline-flex",
							flex: "0 0 auto",
							color: "text.disabled",
							"& .MuiSvgIcon-root": { fontSize: 16 },
						}}
					>
						{icon}
					</Box>
				)}
				<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
					{label}
					{hint && <InfoHint text={hint} />}
				</Box>
			</Box>
			<Box
				sx={{
					typography: "body1",
					fontWeight: 500,
					color: neutral ? "text.primary" : valueColor,
					textAlign: stacked ? "left" : "right",
					minWidth: 0,
					overflowWrap: "anywhere",
					// A stacked value starts under the label text, not under its icon.
					pl: stacked && icon ? "24px" : 0,
					...(valueFigures ? FIGURES_SX[valueFigures] : null),
				}}
			>
				{value}
			</Box>
		</Box>
	);
};

export interface FactListProps {
	children: React.ReactNode;
	/** Hairlines between the rows (default). Off for a compact breakdown under a hero figure. */
	divided?: boolean;
	/** Pads the list to the card's 18px gutter (default); off inside an already padded block. */
	inset?: boolean;
	/** Stacked facts side by side — a fact card in the wide main column. */
	grid?: boolean;
}

/** The body of a fact card: rows on one rhythm, hairlines inset to the card padding. */
export const FactList: React.FC<FactListProps> = ({
	children,
	divided = true,
	inset = true,
	grid = false,
}) => (
	<Box
		sx={{
			px: inset ? "18px" : 0,
			py: inset ? "4px" : 0,
			...(grid
				? {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
						columnGap: "24px",
						py: inset ? "6px" : 0,
					}
				: {
						display: "flex",
						flexDirection: "column",
						[`& > .${FACT_ROW_CLASS}`]: { py: divided ? "11px" : "6px" },
						...(divided && {
							[`& > .${FACT_ROW_CLASS} + .${FACT_ROW_CLASS}`]: {
								borderTop: "1px solid",
								borderColor: "divider",
							},
						}),
					}),
		}}
	>
		{children}
	</Box>
);

/** A hairline between two groups of an undivided list (what was billed · what was paid). */
export const FactDivider: React.FC = () => <Divider sx={{ my: "6px" }} />;

export default FactRow;
