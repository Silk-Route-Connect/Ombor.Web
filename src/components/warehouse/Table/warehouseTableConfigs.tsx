import React from "react";
import StatusPill from "components/shared/Chip/StatusPill";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { WarehouseActionMenu } from "components/warehouse/Table/ActionMenu/WarehouseActionMenu";
import { isReady, Loadable } from "helpers/Loading";
import { TFunction } from "i18next";
import { Warehouse } from "models/warehouse";
import { designTokens, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
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

/** A warehouse's served `lowStockCount` (`WarehouseStore.lowStockCounts`); null until served. */
export const lowStockOf = (
	counts: Loadable<Map<number, number>>,
	warehouse: Warehouse,
): number | null => (isReady(counts) ? (counts.get(warehouse.id) ?? 0) : null);

/** «Заканчивается» cell: the low-stock pill look when any row runs low, a plain «0» when none. */
const LowStockCountCell: React.FC<{ count: number | null }> = ({ count }) => {
	if (count === null) {
		return <NoValue />;
	}
	return count > 0 ? (
		<StatusPill token="warning" icon={TrendingDownIcon} label={formatQuantity(count)} />
	) : (
		<QuantityCell value={0} />
	);
};

/**
 * Warehouse list columns in the canonical order (conventions.md → Tables):
 * Склад · Адрес · Товаров · Заканчивается · Стоимость · ⋮. «Заканчивается» is
 * the served count of the warehouse's rows at or below the product's
 * «Минимальный остаток» — what its «Остатки» tab lists under that filter.
 */
export function buildWarehouseColumns(
	t: TFunction,
	handlers: WarehouseColumnHandlers,
	lowStockCounts: Loadable<Map<number, number>>,
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
			key: "lowStock",
			headerName: t("warehouse.lowStock.title"),
			headerTooltip: t("warehouse.lowStock.hint"),
			align: "right",
			sortValue: (w) => lowStockOf(lowStockCounts, w) ?? -1,
			renderCell: (w) => <LowStockCountCell count={lowStockOf(lowStockCounts, w)} />,
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
