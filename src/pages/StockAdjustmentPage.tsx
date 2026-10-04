import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTableOrder } from "components/shared/Table/tableOrder";
import TableTotals from "components/shared/Table/TableTotals";
import StockAdjustmentModal from "components/stockAdjustment/Form/StockAdjustmentModal";
import StockAdjustmentHeader from "components/stockAdjustment/Header/StockAdjustmentHeader";
import StockAdjustmentsTable from "components/stockAdjustment/Table/StockAdjustmentsTable";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import {
	AdjustmentReason,
	CreateStockAdjustmentRequest,
	StockAdjustment,
} from "models/stockAdjustment";
import { StockAdjustmentFormValues } from "schemas/StockAdjustmentSchema";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatQuantity } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { adjustmentTotals, adjustmentValue } from "utils/listTotals";
import { measurementShort } from "utils/productUtils";

import { Box } from "@mui/material";

const StockAdjustmentPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { stockAdjustmentStore, warehouseStore, productStore } = useStore();
	const tableOrder = useTableOrder<StockAdjustment>();

	useEffect(() => {
		warehouseStore.getAll();
		productStore.getAll();
		stockAdjustmentStore.getAll();
	}, [warehouseStore, productStore, stockAdjustmentStore]);

	const activeWarehouses = readyOr(warehouseStore.activeWarehouses, []);

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
		const rows = !isReady(stockAdjustmentStore.filteredAdjustments)
			? []
			: stockAdjustmentStore.filteredAdjustments;

		const columns: CsvColumn<StockAdjustment>[] = [
			{ header: t("adjustment.table.number"), value: (a) => formatEntityId(a.id) },
			{ header: t("adjustment.table.date"), value: (a) => formatDate(a.date) },
			{ header: t("adjustment.table.product"), value: (a) => a.productName },
			{ header: t("adjustment.table.sku"), value: (a) => a.sku },
			{ header: t("adjustment.table.warehouse"), value: (a) => a.warehouseName },
			{
				header: t("adjustment.table.direction"),
				value: (a) => t(`adjustment.direction.${a.direction}`),
			},
			{ header: t("adjustment.table.reason"), value: (a) => t(`adjustment.reason.${a.reason}`) },
			{ header: t("adjustment.table.createdBy"), value: (a) => a.createdBy },
			{
				header: t("adjustment.table.quantity"),
				value: (a) => (a.direction === "Decrease" ? -a.quantity : a.quantity),
			},
			{ header: t("adjustment.table.unit"), value: (a) => measurementShort(t, a.measurement) },
			{ header: t("adjustment.table.value"), value: (a) => adjustmentValue(a) ?? "" },
			{ header: t("adjustment.table.note"), value: (a) => a.note ?? "" },
		];

		exportToCsv(`stock-adjustments_${csvDateStamp()}`, columns, tableOrder.apply(rows));
	};

	const all = !isReady(stockAdjustmentStore.allAdjustments)
		? null
		: stockAdjustmentStore.allAdjustments;
	const hasAny = (all?.length ?? 0) > 0;
	const rows = stockAdjustmentStore.filteredAdjustments;
	const totals = isReady(rows) ? adjustmentTotals(rows) : null;

	return (
		<Box>
			<StockAdjustmentHeader
				searchValue={stockAdjustmentStore.searchTerm}
				warehouses={activeWarehouses}
				warehouseFilter={stockAdjustmentStore.warehouseFilter}
				directionFilter={stockAdjustmentStore.directionFilter}
				dateRange={stockAdjustmentStore.dateRange}
				onSearch={stockAdjustmentStore.setSearch}
				onWarehouseChange={stockAdjustmentStore.setWarehouseFilter}
				onDirectionChange={stockAdjustmentStore.setDirectionFilter}
				onDateRangeChange={stockAdjustmentStore.setDateRange}
				onCreate={stockAdjustmentStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(stockAdjustmentStore.filteredAdjustments, []).length}
			/>

			<StockAdjustmentsTable
				exportOrder={tableOrder}
				onRetry={() => void stockAdjustmentStore.getAll()}
				errorTitle={t("adjustment.error.getAll")}
				rows={rows}
				isFiltering={stockAdjustmentStore.isFiltering}
				hasAny={hasAny}
				onCreate={stockAdjustmentStore.openCreate}
				summary={
					totals && (
						<TableTotals
							count={t("adjustment.totals.count", {
								count: totals.count,
								formatted: formatQuantity(totals.count),
							})}
							items={[
								{ label: t("adjustment.totals.writtenOff"), value: totals.writtenOff },
								{ label: t("adjustment.totals.restored"), value: totals.restored },
							]}
						/>
					)
				}
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
