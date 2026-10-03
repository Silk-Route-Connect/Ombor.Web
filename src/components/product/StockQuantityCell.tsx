import React from "react";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Measurement } from "models/product";
import { StockLevel } from "utils/productFilters";

import { Box } from "@mui/material";

import StockLevelPill from "./StockLevelPill";

interface StockQuantityCellProps {
	quantity: number;
	measurement: Measurement;
	level: StockLevel;
}

/** A stock figure with its low-stock pill before it («Мало 3 шт»); the figure stays ink. */
const StockQuantityCell: React.FC<StockQuantityCellProps> = ({ quantity, measurement, level }) => (
	<Box
		component="span"
		sx={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}
	>
		<StockLevelPill level={level} />
		<QuantityCell value={quantity} measurement={measurement} />
	</Box>
);

export default StockQuantityCell;
