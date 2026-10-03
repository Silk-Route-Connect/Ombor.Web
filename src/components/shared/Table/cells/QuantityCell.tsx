import React from "react";
import { useTranslation } from "react-i18next";
import { Measurement } from "models/product";
import { numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import { Box } from "@mui/material";

import NoValue from "./NoValue";

interface QuantityCellProps {
	value: number | null | undefined;
	/** Shown as the short unit («шт», «кг») in a muted suffix; omit for plain counts. */
	measurement?: Measurement;
	/** Movement ledgers: sign the figure by direction («+12» in, «−3» out). */
	direction?: "in" | "out";
}

/**
 * Quantity / count column cell: tabular, regular weight, ink — stock levels are
 * never coloured (green/red belong to money). Right-align the column.
 */
export const QuantityCell: React.FC<QuantityCellProps> = ({ value, measurement, direction }) => {
	const { t } = useTranslation();
	if (value == null || !Number.isFinite(value)) {
		return <NoValue />;
	}
	const sign = direction && value !== 0 ? (direction === "in" ? "+" : "−") : "";
	const unit = measurement && measurement !== "None" ? measurementShort(t, measurement) : null;

	return (
		<Box component="span" sx={{ ...numericSx, whiteSpace: "nowrap" }}>
			{sign}
			{formatQuantity(direction ? Math.abs(value) : value)}
			{unit && (
				<Box component="span" sx={{ ml: 0.5, fontSize: 12, color: "text.secondary" }}>
					{unit}
				</Box>
			)}
		</Box>
	);
};

export default QuantityCell;
