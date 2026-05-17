import React, { useEffect } from "react";
import ProductLink from "components/product/Links/ProductLink";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { TAB_DEFAULT_BODY_SX } from "components/shared/SidePane/tabConfigs";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { WarehouseMovement } from "models/warehouse";
import { useStore } from "stores/StoreContext";
import { DateFilter, formatDateTime } from "utils/dateUtils";

import { Box, Link, Typography } from "@mui/material";

interface MovementsTabProps {
	warehouseId: number;
}

const MovementsTab: React.FC<MovementsTabProps> = observer(({ warehouseId }) => {
	const { selectedWarehouseStore } = useStore();

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

	const getReferenceLink = (movement: WarehouseMovement): string | null => {
		if (!movement.referenceType || !movement.referenceId) {
			return null;
		}

		const isSale = movement.type === "Sale" || movement.type === "SaleRefund";

		switch (movement.referenceType) {
			case "Transaction":
				// Determine if it's sale or supply based on movement type
				return isSale ? `/sales/${movement.referenceId}` : `/supplies/${movement.referenceId}`;
			case "Transfer":
				return `/stock-transfers/${movement.referenceId}`;
			case "Adjustment":
				return null; // No specific page for adjustments
			default:
				return null;
		}
	};

	const columns: Column<WarehouseMovement>[] = [
		{
			key: "date",
			field: "createdAt",
			headerName: translate("warehouse.sidePane.movements.date"),
			width: "15%",
			renderCell: (movement) => (
				<Typography variant="body2" noWrap>
					{formatDateTime(movement.createdAt)}
				</Typography>
			),
		},
		{
			key: "product",
			field: "productName",
			headerName: translate("warehouse.sidePane.movements.product"),
			width: "25%",
			renderCell: (movement) => (
				<Box>
					<ProductLink id={movement.productId} name={movement.productName} />
					<Typography variant="caption" display="block" color="text.secondary">
						{movement.productSku}
					</Typography>
				</Box>
			),
		},
		{
			key: "type",
			headerName: translate("warehouse.sidePane.movements.type"),
			width: "20%",
			renderCell: (movement) => {
				if (!movement.referenceType || !movement.referenceId) {
					return (
						<Typography variant="body2" color="text.secondary">
							{translate("common.dash")}
						</Typography>
					);
				}

				const link = getReferenceLink(movement);
				const label = `${translate(`warehouse.referenceType.${movement.referenceType}`)} #${movement.referenceId}`;

				return link ? (
					<Link href={link} underline="hover" color="primary">
						{label}
					</Link>
				) : (
					<Typography variant="body2">{label}</Typography>
				);
			},
		},
		{
			key: "change",
			field: "quantityChange",
			headerName: translate("warehouse.sidePane.movements.change"),
			width: "15%",
			align: "right",
			renderCell: (movement) => (
				<Typography
					variant="body2"
					fontWeight={600}
					color={movement.quantityChange > 0 ? "success.main" : "error.main"}
				>
					{movement.quantityChange > 0 ? "+" : ""}
					{movement.quantityChange}
				</Typography>
			),
		},
		{
			key: "balance",
			field: "balanceAfter",
			headerName: translate("warehouse.sidePane.movements.balance"),
			width: "15%",
			align: "right",
		},
	];

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={TAB_DEFAULT_BODY_SX}>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedWarehouseStore.dateFilter} onChange={handleDateChange} />
				</Box>
			</Box>

			<DataTable<WarehouseMovement>
				rows={selectedWarehouseStore.movements}
				columns={columns}
				pagination
			/>
		</Box>
	);
});

export default MovementsTab;
