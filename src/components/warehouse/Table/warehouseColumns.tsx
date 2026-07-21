import React from "react";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Column } from "components/shared/Table/DataTable/DataTable";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { WarehouseActionMenu } from "components/warehouse/Table/ActionMenu/WarehouseActionMenu";
import { TFunction } from "i18next";
import { Warehouse } from "models/warehouse";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

interface WarehouseColumnHandlers {
	onEdit: (warehouse: Warehouse) => void;
	onArchive: (warehouse: Warehouse) => void;
	onRestore: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
}

/** Square warehouse-icon avatar (the list name cell), dimmed when archived. */
const WarehouseAvatar: React.FC<{ archived: boolean }> = ({ archived }) => (
	<Box
		sx={{
			width: 36,
			height: 36,
			flex: "0 0 auto",
			borderRadius: "8px",
			display: "inline-grid",
			placeItems: "center",
			bgcolor: "primary.light",
			color: "primary.main",
			opacity: archived ? 0.5 : 1,
		}}
	>
		<WarehouseOutlinedIcon sx={{ fontSize: 18 }} />
	</Box>
);

const Muted: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * Warehouse list columns (canonical order — locked pattern): entity → descriptive
 * → money (right, tabular, last before ⋮). Warehouses carry no date or type chip.
 * Every column is sortable except the actions cell; the name is a
 * {@link WarehouseLink} (the row is also clickable; the link stops propagation).
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
				<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
					<WarehouseAvatar archived={w.isArchived} />
					<Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
						<Box
							component="span"
							onClick={(e) => e.stopPropagation()}
							sx={{
								fontWeight: 600,
								"& a": w.isArchived
									? { color: "text.secondary", textDecorationLine: "line-through" }
									: undefined,
							}}
						>
							<WarehouseLink id={w.id} name={w.name} />
						</Box>
						{w.isArchived && <ArchivedBadge label={t("warehouse.table.archivedBadge")} />}
					</Box>
				</Box>
			),
		},
		{
			key: "address",
			headerName: t("warehouse.table.address"),
			sortValue: (w) => w.location ?? "",
			renderCell: (w) =>
				w.location ? (
					<Box
						component="span"
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "7px",
							color: "text.secondary",
							whiteSpace: "nowrap",
							opacity: w.isArchived ? 0.6 : 1,
						}}
					>
						<PlaceOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
						{w.location}
					</Box>
				) : (
					<Muted />
				),
		},
		{
			key: "products",
			headerName: t("warehouse.table.products"),
			align: "right",
			sortValue: (w) => w.productCount,
			renderCell: (w) => (
				<Box component="span" sx={{ color: designTokens.gray700, opacity: w.isArchived ? 0.6 : 1 }}>
					{formatQuantity(w.productCount)}
				</Box>
			),
		},
		{
			key: "units",
			headerName: t("warehouse.table.units"),
			align: "right",
			sortValue: (w) => w.totalUnits,
			renderCell: (w) => (
				<Box component="span" sx={{ fontWeight: 600, opacity: w.isArchived ? 0.6 : 1 }}>
					{formatQuantity(w.totalUnits)}
				</Box>
			),
		},
		{
			key: "stockValue",
			headerName: t("warehouse.table.stockValue"),
			align: "right",
			sortValue: (w) => w.stockValue,
			renderCell: (w) => (
				<Typography
					component="span"
					sx={{ ...numericSx, fontWeight: 700, opacity: w.isArchived ? 0.6 : 1 }}
				>
					{formatCurrency(w.stockValue)}
					<UzsUnit />
				</Typography>
			),
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: 56,
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
