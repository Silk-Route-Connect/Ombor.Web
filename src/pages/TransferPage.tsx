import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import TableTotals from "components/shared/Table/TableTotals";
import TransferDetailModal from "components/transfer/Detail/TransferDetailModal";
import TransferFormModal from "components/transfer/Form/TransferFormModal";
import TransferHeader from "components/transfer/Header/TransferHeader";
import TransfersTable from "components/transfer/Table/TransfersTable";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { CreateTransferRequest, Transfer, transferUnits } from "models/transfer";
import { PATHS } from "routing/paths";
import { TransferFormValues } from "schemas/TransferSchema";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatQuantity } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";

import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box } from "@mui/material";

const TransferPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { transferStore, warehouseStore, productStore } = useStore();

	useEffect(() => {
		warehouseStore.getAll();
		productStore.getAll();
		transferStore.getAll();
	}, [warehouseStore, productStore, transferStore]);

	const activeWarehouses = readyOr(warehouseStore.activeWarehouses, []);
	// A transfer needs two warehouses; a new organisation has only the starter one,
	// so «Новое перемещение» explains that instead of opening an unfillable form.
	const needsSecondWarehouse =
		isReady(warehouseStore.activeWarehouses) && activeWarehouses.length < 2;

	const createSecondWarehouse = (): void => {
		transferStore.closeDialog();
		warehouseStore.openCreate();
		navigate(PATHS.warehouses);
	};

	const handleFormSave = (payload: TransferFormValues): void => {
		const request: CreateTransferRequest = {
			fromWarehouseId: payload.fromWarehouseId,
			toWarehouseId: payload.toWarehouseId,
			note: payload.note,
			lines: payload.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
		};
		transferStore.create(request);
	};

	const handleExport = (): void => {
		const rows = readyOr(transferStore.filteredTransfers, []);

		const columns: CsvColumn<Transfer>[] = [
			{ header: t("transfer.table.number"), value: (tr) => formatEntityId(tr.id) },
			{ header: t("transfer.table.date"), value: (tr) => formatDate(tr.date) },
			{ header: t("transfer.table.from"), value: (tr) => tr.fromWarehouseName },
			{ header: t("transfer.table.to"), value: (tr) => tr.toWarehouseName },
			{ header: t("transfer.table.createdBy"), value: (tr) => tr.createdBy },
			{ header: t("transfer.table.positions"), value: (tr) => tr.lines.length },
			{ header: t("transfer.table.units"), value: (tr) => transferUnits(tr) },
		];

		exportToCsv(`transfers_${csvDateStamp()}`, columns, rows);
	};

	const all = !isReady(transferStore.allTransfers) ? null : transferStore.allTransfers;
	const hasAny = (all?.length ?? 0) > 0;
	const dialogMode = transferStore.dialogMode;
	const rows = transferStore.filteredTransfers;

	return (
		<Box>
			<TransferHeader
				warehouses={activeWarehouses}
				warehouseFilter={transferStore.warehouseFilter}
				onWarehouseChange={transferStore.setWarehouseFilter}
				search={transferStore.searchTerm}
				onSearchChange={transferStore.setSearch}
				dateRange={transferStore.dateRange}
				onDateRangeChange={transferStore.setDateRange}
				onCreate={transferStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(rows, []).length}
			/>

			<TransfersTable
				onRetry={() => void transferStore.getAll()}
				errorTitle={t("transfer.error.getAll")}
				rows={rows}
				isFiltering={transferStore.isFiltering}
				hasAny={hasAny}
				onOpen={transferStore.openDetail}
				onCreate={transferStore.openCreate}
				summary={
					isReady(rows) && (
						<TableTotals
							count={t("transfer.totals.count", {
								count: rows.length,
								formatted: formatQuantity(rows.length),
							})}
						/>
					)
				}
			/>

			<TransferFormModal
				isOpen={dialogMode.kind === "create" && !needsSecondWarehouse}
				isSaving={transferStore.isSaving}
				warehouses={activeWarehouses}
				onClose={transferStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "create" && needsSecondWarehouse}
				icon={<WarehouseOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("transfer.needsSecond.title")}
				content={
					activeWarehouses.length === 1
						? t("transfer.needsSecond.body", { name: activeWarehouses[0].name })
						: t("transfer.needsSecond.bodyNone")
				}
				confirmLabel={t("transfer.needsSecond.create")}
				cancelLabel={t("common.close")}
				confirmVariant="primary"
				onConfirm={createSecondWarehouse}
				onCancel={transferStore.closeDialog}
			/>

			<TransferDetailModal
				transfer={dialogMode.kind === "detail" ? dialogMode.transfer : null}
				onClose={transferStore.closeDialog}
			/>
		</Box>
	);
});

export default TransferPage;
