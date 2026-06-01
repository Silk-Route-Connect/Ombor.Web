import React, { useEffect, useMemo, useState } from "react";
import ProductLink from "components/product/Links/ProductLink";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { MOVEMENT_TYPES, MovementType, WarehouseMovement } from "models/warehouse";
import { useStore } from "stores/StoreContext";
import { DateFilter, formatDateTime } from "utils/dateUtils";

import { Box, Link, MenuItem, TextField, Typography } from "@mui/material";

const ALL_TYPES = "__all__";

function referenceLink(movement: WarehouseMovement): string | null {
	if (!movement.referenceType || !movement.referenceId) {
		return null;
	}
	const isSale = movement.type === "Sale" || movement.type === "SaleRefund";
	switch (movement.referenceType) {
		case "Transaction":
			return isSale ? `/sales/${movement.referenceId}` : `/supplies/${movement.referenceId}`;
		case "Transfer":
			return `/stock-transfers/${movement.referenceId}`;
		default:
			return null;
	}
}

/**
 * Human-readable name of the document a movement points to. Names the specific
 * transaction type (Продажа / Поставка / Возврат продажи / Возврат поставки)
 * rather than the generic "Транзакция".
 */
function documentLabel(movement: WarehouseMovement): string {
	switch (movement.type) {
		case "Sale":
		case "Supply":
		case "SaleRefund":
		case "SupplyRefund":
			return translate(`warehouse.movementType.${movement.type}`);
		case "TransferIn":
		case "TransferOut":
			return translate("warehouse.detail.action.transfer");
		case "Adjustment":
			return translate("warehouse.referenceType.Adjustment");
		default:
			return translate(`warehouse.movementType.${movement.type}`);
	}
}

const DetailMovementsTab: React.FC<{ warehouseId: number }> = observer(({ warehouseId }) => {
	const { selectedWarehouseStore } = useStore();
	const [type, setType] = useState<string>(ALL_TYPES);

	useEffect(() => {
		if (warehouseId) {
			selectedWarehouseStore.getMovements(warehouseId);
		}
	}, [warehouseId, selectedWarehouseStore]);

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedWarehouseStore.setCustom(filter.from, filter.to);
		} else {
			selectedWarehouseStore.setPreset(filter.preset);
		}
	};

	const movements = selectedWarehouseStore.movements;
	const rows = useMemo<typeof movements>(() => {
		if (movements === "loading" || type === ALL_TYPES) {
			return movements;
		}
		return movements.filter((m) => m.type === type);
	}, [movements, type]);

	const columns: Column<WarehouseMovement>[] = [
		{
			key: "date",
			headerName: translate("warehouse.detail.movements.col.date"),
			renderCell: (m) => (
				<Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
					{formatDateTime(m.createdAt)}
				</Typography>
			),
		},
		{
			key: "type",
			headerName: translate("warehouse.detail.movements.col.type"),
			renderCell: (m) => {
				const incoming = m.quantityChange > 0;
				return (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: incoming ? "success.main" : "error.main",
							}}
						/>
						<Typography variant="body2">{translate(`warehouse.movementType.${m.type}`)}</Typography>
					</Box>
				);
			},
		},
		{
			key: "document",
			headerName: translate("warehouse.detail.movements.col.document"),
			renderCell: (m) => {
				if (!m.referenceType || !m.referenceId) {
					return (
						<Typography variant="body2" sx={{ color: "text.disabled" }}>
							—
						</Typography>
					);
				}
				const link = referenceLink(m);
				const label = `${documentLabel(m)} #${m.referenceId}`;
				return link ? (
					<Link href={link} underline="hover">
						{label}
					</Link>
				) : (
					<Typography variant="body2">{label}</Typography>
				);
			},
		},
		{
			key: "product",
			headerName: translate("warehouse.detail.movements.col.product"),
			renderCell: (m) => (
				<Box>
					<ProductLink id={m.productId} name={m.productName} />
					<Typography variant="caption" display="block" sx={{ color: "text.secondary" }}>
						{m.productSku}
					</Typography>
				</Box>
			),
		},
		{
			key: "quantity",
			headerName: translate("warehouse.detail.movements.col.quantity"),
			align: "right",
			renderCell: (m) => (
				<Typography
					variant="body2"
					sx={{
						fontWeight: 600,
						fontVariantNumeric: "tabular-nums",
						color: m.quantityChange > 0 ? "success.main" : "error.main",
					}}
				>
					{m.quantityChange > 0 ? "+" : "−"}
					{Math.abs(m.quantityChange)}
				</Typography>
			),
		},
		{
			key: "balance",
			field: "balanceAfter",
			headerName: translate("warehouse.detail.movements.col.balance"),
			align: "right",
			renderCell: (m) => (
				<Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
					{m.balanceAfter.toLocaleString("ru-RU")}
				</Typography>
			),
		},
	];

	return (
		<Box>
			<Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 2 }}>
				<DateFilterPicker value={selectedWarehouseStore.dateFilter} onChange={handleDateChange} />
				<Box sx={{ flex: 1 }} />
				<TextField
					select
					value={type}
					onChange={(e) => setType(e.target.value)}
					size="small"
					sx={{ minWidth: 200 }}
				>
					<MenuItem value={ALL_TYPES}>{translate("warehouse.detail.allTypes")}</MenuItem>
					{MOVEMENT_TYPES.map((t: MovementType) => (
						<MenuItem key={t} value={t}>
							{translate(`warehouse.movementType.${t}`)}
						</MenuItem>
					))}
				</TextField>
			</Box>

			<DataTable<WarehouseMovement> rows={rows} columns={columns} pagination />
		</Box>
	);
});

export default DetailMovementsTab;
