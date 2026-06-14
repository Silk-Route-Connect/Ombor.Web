import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import WarehouseFormModal from "components/warehouse/Form/WarehouseFormModal";
import WarehouseHeader from "components/warehouse/Header/WarehouseHeader";
import WarehousesTable from "components/warehouse/Table/WarehousesTable";
import { observer } from "mobx-react-lite";
import { CreateWarehouseRequest, Warehouse } from "models/warehouse";
import { warehouseDetailPath } from "routing/paths";
import { WarehouseFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
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

		const columns: CsvColumn<Warehouse>[] = [
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

		exportToCsv(`warehouses_${csvDateStamp()}`, columns, rows);
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

			<WarehousesTable
				rows={warehouseStore.filteredWarehouses}
				totals={warehouseStore.totals}
				showArchived={warehouseStore.showArchived}
				isFiltering={isFiltering}
				hasAny={hasAny}
				hasActive={hasActive}
				onOpen={(warehouse) => navigate(warehouseDetailPath(warehouse.id))}
				onCreate={warehouseStore.openCreate}
				onEdit={warehouseStore.openEdit}
				onArchive={warehouseStore.openArchive}
				onRestore={warehouseStore.openRestore}
			/>

			<WarehouseFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={warehouseStore.isSaving}
				warehouse={editingWarehouse}
				onClose={warehouseStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "archive"}
				icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("warehouse.archive.title", {
					name: dialogMode.kind === "archive" ? dialogMode.warehouse.name : "",
				})}
				content={t("warehouse.archive.body")}
				confirmLabel={t("common.archive")}
				cancelLabel={t("common.cancel")}
				confirmVariant="warning"
				onCancel={warehouseStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "archive") {
						warehouseStore.archive(dialogMode.warehouse);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "restore"}
				icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("warehouse.restore.title", {
					name: dialogMode.kind === "restore" ? dialogMode.warehouse.name : "",
				})}
				content={t("warehouse.restore.body")}
				confirmLabel={t("common.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={warehouseStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "restore") {
						warehouseStore.restore(dialogMode.warehouse);
					}
				}}
			/>
		</Box>
	);
});

export default WarehousePage;
