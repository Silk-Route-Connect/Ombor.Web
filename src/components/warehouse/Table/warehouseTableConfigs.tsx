import React from "react";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { WarehouseActionMenu } from "components/warehouse/Table/ActionMenu/WarehouseActionMenu";
import { TFunction } from "i18next";
import { Warehouse } from "models/warehouse";
import { designTokens, radius } from "theme";

import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box } from "@mui/material";

interface WarehouseColumnHandlers {
	onEdit: (warehouse: Warehouse) => void;
	onArchive: (warehouse: Warehouse) => void;
	onRestore: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
}

/** Square warehouse-icon tile leading the name; neutral when archived. */
const WarehouseAvatar: React.FC<{ archived: boolean }> = ({ archived }) => (
	<Box
		sx={{
			width: 36,
			height: 36,
			flex: "0 0 auto",
			borderRadius: `${radius.md}px`,
			display: "inline-grid",
			placeItems: "center",
			bgcolor: archived ? designTokens.gray100 : "primary.light",
			color: archived ? "text.secondary" : "primary.main",
		}}
	>
		<WarehouseOutlinedIcon sx={{ fontSize: 18 }} />
	</Box>
);

/**
 * Warehouse list columns in the canonical order (conventions.md → Tables):
 * Склад · Адрес · Товаров · Единиц · Стоимость · ⋮.
 */
export function buildWarehouseColumns(
	t: TFunction,
	handlers: WarehouseColumnHandlers,
): Column<Warehouse>[] {
	return [
		{
			key: "name",
			headerName: t("warehouse.table.name"),
			sortValue: (w) => w.name,
			renderCell: (w) => (
				<EntityCell archived={w.isArchived} avatar={<WarehouseAvatar archived={w.isArchived} />}>
					<WarehouseLink id={w.id} name={w.name} archived={w.isArchived} />
				</EntityCell>
			),
		},
		{
			key: "address",
			headerName: t("warehouse.table.address"),
			sortValue: (w) => w.location ?? "",
			renderCell: (w) => <MutedTextCell text={w.location} />,
		},
		{
			key: "products",
			headerName: t("warehouse.table.products"),
			align: "right",
			sortValue: (w) => w.productCount,
			renderCell: (w) => <QuantityCell value={w.productCount} />,
		},
		{
			key: "units",
			headerName: t("warehouse.table.units"),
			align: "right",
			sortValue: (w) => w.totalUnits,
			renderCell: (w) => <QuantityCell value={w.totalUnits} />,
		},
		{
			key: "stockValue",
			headerName: t("warehouse.table.stockValue"),
			align: "right",
			sortValue: (w) => w.stockValue,
			renderCell: (w) => <MoneyCell value={w.stockValue} main />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
			renderCell: (w) => (
				<WarehouseActionMenu
					warehouse={w}
					onEdit={() => handlers.onEdit(w)}
					onArchive={() => handlers.onArchive(w)}
					onRestore={() => handlers.onRestore(w)}
					onDelete={() => handlers.onDelete(w)}
				/>
			),
		},
	];
}
