import React from "react";
import { useTranslation } from "react-i18next";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { WarehouseStockItem } from "models/warehouse";
import { iconSize, radius } from "theme";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, IconButton, Tooltip } from "@mui/material";

interface StockThresholdCellProps {
	row: WarehouseStockItem;
	/** Opens the row's «Порог» dialog. */
	onEdit: (row: WarehouseStockItem) => void;
}

/**
 * «Порог» of a warehouse stock row (DR-41): the threshold in the product's unit,
 * «—» while the row is not tracked, and a pencil that opens the row's dialog —
 * always visible, so a shopkeeper finds where a threshold is set.
 */
const StockThresholdCell: React.FC<StockThresholdCellProps> = ({ row, onEdit }) => {
	const { t } = useTranslation();
	const action = row.lowStockThreshold != null ? "edit" : "set";
	const label = t(`warehouse.threshold.${action}`, { name: row.productName });

	return (
		<Box
			component="span"
			sx={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}
		>
			<QuantityCell value={row.lowStockThreshold} measurement={row.measurement} />
			<Tooltip title={t(`warehouse.threshold.${action}Short`)} placement="top">
				<IconButton
					size="small"
					aria-label={label}
					onClick={() => onEdit(row)}
					sx={{
						width: 28,
						height: 28,
						borderRadius: `${radius.sm}px`,
						color: "text.secondary",
						"&:hover": { color: "primary.main" },
					}}
				>
					<EditOutlinedIcon sx={{ fontSize: iconSize.sm }} />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

export default StockThresholdCell;
