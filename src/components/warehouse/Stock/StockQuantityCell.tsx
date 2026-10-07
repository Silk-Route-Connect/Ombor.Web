import React from "react";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Measurement } from "models/product";
import { StockLevel } from "utils/stockLevel";

import { Box } from "@mui/material";

import StockLevelPill from "./StockLevelPill";

interface StockQuantityCellProps {
	quantity: number;
	measurement: Measurement;
	level: StockLevel;
}

/**
 * A stock figure with its pill before it («Мало 3 шт»); the figure stays ink.
 * When the column is tight the pill wraps above the figure, so the pill never
 * widens a table past a 1366px screen.
 */
const StockQuantityCell: React.FC<StockQuantityCellProps> = ({ quantity, measurement, level }) => (
	<Box
		component="span"
		sx={{
			display: "inline-flex",
			flexWrap: "wrap",
			alignItems: "center",
			justifyContent: "flex-end",
			columnGap: 1,
			rowGap: "4px",
		}}
	>
		<StockLevelPill level={level} />
		<QuantityCell value={quantity} measurement={measurement} />
	</Box>
);

export default StockQuantityCell;
