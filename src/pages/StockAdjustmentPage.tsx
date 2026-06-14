import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import StockAdjustmentModal from "components/stockAdjustment/Form/StockAdjustmentModal";
import StockAdjustmentHeader from "components/stockAdjustment/Header/StockAdjustmentHeader";
import StockAdjustmentsTable from "components/stockAdjustment/Table/StockAdjustmentsTable";
import { observer } from "mobx-react-lite";
import {
	AdjustmentReason,
	CreateStockAdjustmentRequest,
	StockAdjustment,
} from "models/stockAdjustment";
import { Warehouse } from "models/warehouse";
import { StockAdjustmentFormValues } from "schemas/StockAdjustmentSchema";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import { Box } from "@mui/material";

const StockAdjustmentPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { stockAdjustmentStore, warehouseStore, productStore } = useStore();

	useEffect(() => {
		warehouseStore.getAll();
		productStore.getAll();
		stockAdjustmentStore.getAll();
	}, [warehouseStore, productStore, stockAdjustmentStore]);

	const activeWarehouses: Warehouse[] =
		warehouseStore.allWarehouses === "loading"
			? []
			: warehouseStore.allWarehouses.filter((w) => !w.isArchived);

	const handleFormSave = (payload: StockAdjustmentFormValues): void => {
		const request: CreateStockAdjustmentRequest = {
			warehouseId: payload.warehouseId,
			productId: payload.productId,
			direction: payload.direction,
			quantity: payload.quantity,
			reason: payload.reason as AdjustmentReason,
			note: payload.note,
		};
		stockAdjustmentStore.create(request);
	};

	const handleExport = (): void => {
		const rows =
			stockAdjustmentStore.filteredAdjustments === "loading"
				? []
				: stockAdjustmentStore.filteredAdjustments;

		const columns: CsvColumn<StockAdjustment>[] = [
			{ header: t("adjustment.table.date"), value: (a) => formatDate(a.date) },
			{ header: t("adjustment.table.warehouse"), value: (a) => a.warehouseName },
			{ header: t("adjustment.table.product"), value: (a) => a.productName },
			{ header: t("adjustment.table.sku"), value: (a) => a.sku },
			{
				header: t("adjustment.table.direction"),
				value: (a) => t(`adjustment.direction.${a.direction}`),
			},
			{
				header: t("adjustment.table.quantity"),
				value: (a) =>
					`${a.direction === "Decrease" ? "-" : "+"}${a.quantity} ${MEASUREMENT_SHORT[a.measurement]}`,
			},
			{ header: t("adjustment.table.reason"), value: (a) => t(`adjustment.reason.${a.reason}`) },
			{ header: t("adjustment.table.createdBy"), value: (a) => a.createdBy },
			{ header: t("adjustment.table.note"), value: (a) => a.note ?? "" },
		];

		exportToCsv(`stock-adjustments_${csvDateStamp()}`, columns, rows);
	};

	const all =
		stockAdjustmentStore.allAdjustments === "loading" ? null : stockAdjustmentStore.allAdjustments;
	const totalCount = all?.length ?? null;
	const hasAny = (all?.length ?? 0) > 0;
	const isFiltering =
		stockAdjustmentStore.searchTerm.trim().length > 0 ||
		stockAdjustmentStore.warehouseFilter != null ||
		stockAdjustmentStore.directionFilter !== "all";

	return (
		<Box>
			<StockAdjustmentHeader
				totalCount={totalCount}
				searchValue={stockAdjustmentStore.searchTerm}
				warehouses={activeWarehouses}
				warehouseFilter={stockAdjustmentStore.warehouseFilter}
				directionFilter={stockAdjustmentStore.directionFilter}
				onSearch={stockAdjustmentStore.setSearch}
				onWarehouseChange={stockAdjustmentStore.setWarehouseFilter}
				onDirectionChange={stockAdjustmentStore.setDirectionFilter}
				onCreate={stockAdjustmentStore.openCreate}
				onExport={handleExport}
			/>

			<StockAdjustmentsTable
				rows={stockAdjustmentStore.filteredAdjustments}
				isFiltering={isFiltering}
				hasAny={hasAny}
				onCreate={stockAdjustmentStore.openCreate}
			/>

			<StockAdjustmentModal
				isOpen={stockAdjustmentStore.dialogMode.kind === "create"}
				isSaving={stockAdjustmentStore.isSaving}
				warehouses={activeWarehouses}
				onClose={stockAdjustmentStore.closeDialog}
				onSave={handleFormSave}
			/>
		</Box>
	);
});

export default StockAdjustmentPage;
