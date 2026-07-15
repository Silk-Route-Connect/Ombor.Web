import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TransferDetailModal from "components/transfer/Detail/TransferDetailModal";
import TransferFormModal from "components/transfer/Form/TransferFormModal";
import TransferHeader from "components/transfer/Header/TransferHeader";
import TransfersTable from "components/transfer/Table/TransfersTable";
import { observer } from "mobx-react-lite";
import { CreateTransferRequest, Transfer, transferUnits } from "models/transfer";
import { Warehouse } from "models/warehouse";
import { TransferFormValues } from "schemas/TransferSchema";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { matchesSearch } from "utils/stringUtils";

import { Box } from "@mui/material";

const TransferPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { transferStore, warehouseStore, productStore } = useStore();
	const [search, setSearch] = useState("");

	useEffect(() => {
		warehouseStore.getAll();
		productStore.getAll();
		transferStore.getAll();
	}, [warehouseStore, productStore, transferStore]);

	const activeWarehouses: Warehouse[] =
		warehouseStore.allWarehouses === "loading"
			? []
			: warehouseStore.allWarehouses.filter((w) => !w.isArchived);

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
		const rows =
			transferStore.filteredTransfers === "loading" ? [] : transferStore.filteredTransfers;

		const columns: CsvColumn<Transfer>[] = [
			{ header: t("transfer.table.date"), value: (tr) => formatDate(tr.date) },
			{ header: t("transfer.table.from"), value: (tr) => tr.fromWarehouseName },
			{ header: t("transfer.table.to"), value: (tr) => tr.toWarehouseName },
			{ header: t("transfer.table.positions"), value: (tr) => tr.lines.length },
			{ header: t("transfer.table.units"), value: (tr) => transferUnits(tr) },
			{ header: t("transfer.table.createdBy"), value: (tr) => tr.createdBy },
		];

		exportToCsv(`transfers_${csvDateStamp()}`, columns, rows);
	};

	const all = transferStore.allTransfers === "loading" ? null : transferStore.allTransfers;
	const totalCount = all?.length ?? null;
	const hasAny = (all?.length ?? 0) > 0;
	const isFiltering = transferStore.warehouseFilter != null || search.trim() !== "";
	const dialogMode = transferStore.dialogMode;

	const base = transferStore.filteredTransfers;
	const rows =
		base === "loading" || search.trim() === ""
			? base
			: base.filter((tr) =>
					matchesSearch([tr.fromWarehouseName, tr.toWarehouseName, tr.createdBy].join(" "), search),
				);

	return (
		<Box>
			<TransferHeader
				totalCount={totalCount}
				warehouses={activeWarehouses}
				warehouseFilter={transferStore.warehouseFilter}
				onWarehouseChange={transferStore.setWarehouseFilter}
				search={search}
				onSearchChange={setSearch}
				onCreate={transferStore.openCreate}
				onExport={handleExport}
			/>

			<TransfersTable
				rows={rows}
				isFiltering={isFiltering}
				hasAny={hasAny}
				onOpen={transferStore.openDetail}
				onCreate={transferStore.openCreate}
			/>

			<TransferFormModal
				isOpen={dialogMode.kind === "create"}
				isSaving={transferStore.isSaving}
				warehouses={activeWarehouses}
				onClose={transferStore.closeDialog}
				onSave={handleFormSave}
			/>

			<TransferDetailModal
				transfer={dialogMode.kind === "detail" ? dialogMode.transfer : null}
				onClose={transferStore.closeDialog}
			/>
		</Box>
	);
});

export default TransferPage;
