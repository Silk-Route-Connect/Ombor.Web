import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import WarehouseFormModal from "components/warehouse/Form/WarehouseFormModal";
import WarehouseHeader from "components/warehouse/Header/WarehouseHeader";
import { buildWarehouseColumns } from "components/warehouse/Table/warehouseColumns";
import WarehousesTable from "components/warehouse/Table/WarehousesTable";
import WarehouseSummaryStrip from "components/warehouse/Table/WarehouseSummaryStrip";
import WarehouseDialogs from "components/warehouse/WarehouseDialogs";
import { observer } from "mobx-react-lite";
import { CreateWarehouseRequest, Warehouse } from "models/warehouse";
import { warehouseDetailPath } from "routing/paths";
import { WarehouseFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import { Box } from "@mui/material";

const WarehousePage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { warehouseStore } = useStore();

	useEffect(() => {
		warehouseStore.getAll();
	}, [warehouseStore]);

	const dialogMode = warehouseStore.dialogMode;
	const editingWarehouse = dialogMode.kind === "form" ? (dialogMode.warehouse ?? null) : null;

	const handleDelete = (warehouse: Warehouse): void => {
		if (warehouse.isDeletable) {
			warehouseStore.openDelete(warehouse);
		} else {
			warehouseStore.openCannotDelete(warehouse);
		}
	};

	const columns = useMemo(
		() =>
			buildWarehouseColumns(t, {
				onEdit: (w) => warehouseStore.openEdit(w),
				onArchive: (w) => warehouseStore.openArchive(w),
				onRestore: (w) => warehouseStore.openRestore(w),
				onDelete: handleDelete,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t],
	);

	const handleFormSave = (payload: WarehouseFormValues): void => {
		const request: CreateWarehouseRequest = { name: payload.name, location: payload.location };

		if (editingWarehouse) {
			warehouseStore.update({ ...request, id: editingWarehouse.id });
		} else {
			warehouseStore.create(request);
		}
	};

	const handleExport = (): void => {
		const rows =
			warehouseStore.filteredWarehouses === "loading" ? [] : warehouseStore.filteredWarehouses;

		const csvColumns: CsvColumn<Warehouse>[] = [
			{ header: t("warehouse.table.name"), value: (w) => w.name },
			{ header: t("warehouse.table.address"), value: (w) => w.location ?? "" },
			{ header: t("warehouse.table.products"), value: (w) => w.productCount },
			{ header: t("warehouse.table.units"), value: (w) => w.totalUnits },
			{ header: t("warehouse.table.stockValue"), value: (w) => w.stockValue },
			{
				header: t("warehouse.table.status"),
				value: (w) =>
					w.isArchived ? t("warehouse.table.archivedBadge") : t("warehouse.table.statusActive"),
			},
		];

		exportToCsv(`warehouses_${csvDateStamp()}`, csvColumns, rows);
	};

	const all = warehouseStore.allWarehouses === "loading" ? null : warehouseStore.allWarehouses;
	const totalCount = all?.length ?? null;
	const isFiltering = warehouseStore.searchTerm.trim().length > 0;
	const hasAny = (all?.length ?? 0) > 0;
	const hasActive = (all ?? []).some((w) => !w.isArchived);

	return (
		<Box>
			<WarehouseHeader
				totalCount={totalCount}
				searchValue={warehouseStore.searchTerm}
				showArchived={warehouseStore.showArchived}
				archivedCount={warehouseStore.archivedCount}
				onSearch={warehouseStore.setSearch}
				onToggleArchived={warehouseStore.setShowArchived}
				onCreate={warehouseStore.openCreate}
				onExport={handleExport}
			/>

			{hasAny && <WarehouseSummaryStrip totals={warehouseStore.totals} />}

			<WarehousesTable
				rows={warehouseStore.filteredWarehouses}
				columns={columns}
				isFiltering={isFiltering}
				hasAny={hasAny}
				hasActive={hasActive}
				showArchived={warehouseStore.showArchived}
				onOpen={(warehouse) => navigate(warehouseDetailPath(warehouse.id))}
				onCreate={warehouseStore.openCreate}
			/>

			<WarehouseFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={warehouseStore.isSaving}
				warehouse={editingWarehouse}
				onClose={warehouseStore.closeDialog}
				onSave={handleFormSave}
			/>

			<WarehouseDialogs />
		</Box>
	);
});

export default WarehousePage;
