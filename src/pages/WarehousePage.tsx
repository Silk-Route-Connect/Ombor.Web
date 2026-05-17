import React, { useEffect, useMemo } from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import AdjustStockDialog from "components/warehouse/AdjustStock/AdjustStockDialog";
import WarehouseFormDialog from "components/warehouse/Form/WarehouseFormDialog";
import WarehouseHeader from "components/warehouse/Header/WarehouseHeader";
import WarehouseSidePane from "components/warehouse/SidePane/WarehouseSidePane";
import WarehouseTable from "components/warehouse/Table/WarehouseTable";
import TransferStockDialog from "components/warehouse/TransferStock/TransferStockDialog";
import { AdjustStockFormPayload } from "hooks/warehouse/useAdjustStockForm";
import { WarehouseFormPayload } from "hooks/warehouse/useWarehouseForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box } from "@mui/material";

const WarehousesPage: React.FC = observer(() => {
	const { warehouseStore, selectedWarehouseStore } = useStore();

	useEffect(() => {
		warehouseStore.getAll();
	}, [warehouseStore]);

	const handleFormSave = (payload: WarehouseFormPayload) => {
		const warehouse =
			warehouseStore.dialogMode.kind === "form" ? warehouseStore.dialogMode.warehouse : null;

		if (warehouse) {
			warehouseStore.update({ id: warehouse.id, ...payload });
		} else {
			warehouseStore.create(payload);
		}
	};

	const handleAdjustStockSave = (payload: AdjustStockFormPayload) => {
		const warehouse =
			warehouseStore.dialogMode.kind === "adjustStock" ? warehouseStore.dialogMode.warehouse : null;

		if (warehouse) {
			selectedWarehouseStore.adjustStock({
				warehouseId: warehouse.id,
				...payload,
			});
		}
	};

	const handleDeleteConfirmed = () => {
		const warehouse =
			warehouseStore.dialogMode.kind === "delete" ? warehouseStore.dialogMode.warehouse : null;

		if (warehouse) {
			warehouseStore.delete(warehouse.id);
		}
	};

	const warehousesCount = useMemo(() => {
		if (warehouseStore.filteredWarehouses === "loading") {
			return "";
		}
		return warehouseStore.filteredWarehouses.length.toString();
	}, [warehouseStore.filteredWarehouses]);

	const dialogMode = warehouseStore.dialogMode;

	return (
		<Box>
			<WarehouseHeader
				searchValue={warehouseStore.searchTerm}
				titleCount={warehousesCount}
				onSearch={warehouseStore.setSearch}
				onCreate={warehouseStore.openCreate}
			/>

			<WarehouseTable
				data={warehouseStore.filteredWarehouses}
				onSort={warehouseStore.setSort}
				onRowClick={warehouseStore.openDetails}
				onEdit={warehouseStore.openEdit}
				onDelete={warehouseStore.openDelete}
				onAdjustStock={warehouseStore.openAdjustStock}
				onTransfer={warehouseStore.openTransfer}
			/>

			<WarehouseFormDialog
				isOpen={dialogMode.kind === "form"}
				isSaving={warehouseStore.isSaving}
				warehouse={dialogMode.kind === "form" ? dialogMode.warehouse : null}
				onClose={warehouseStore.closeDialog}
				onSave={handleFormSave}
			/>

			<AdjustStockDialog
				isOpen={dialogMode.kind === "adjustStock"}
				isSaving={selectedWarehouseStore.isSaving}
				warehouse={dialogMode.kind === "adjustStock" ? dialogMode.warehouse : null}
				onClose={warehouseStore.closeDialog}
				onSave={handleAdjustStockSave}
			/>

			<TransferStockDialog
				isOpen={dialogMode.kind === "transfer"}
				isSaving={warehouseStore.isSaving}
				fromWarehouse={dialogMode.kind === "transfer" ? dialogMode.warehouse : null}
				onClose={warehouseStore.closeDialog}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "delete"}
				title={translate("common.deleteTitle")}
				content={translate("warehouse.deleteConfirmation", {
					warehouseName: dialogMode.kind === "delete" ? dialogMode.warehouse.name : "",
				})}
				onConfirm={handleDeleteConfirmed}
				onCancel={warehouseStore.closeDialog}
			/>

			<WarehouseSidePane
				open={!!warehouseStore.selectedWarehouse}
				warehouse={warehouseStore.selectedWarehouse}
				onClose={() => warehouseStore.setSelectedWarehouse(null)}
				onEdit={warehouseStore.openEdit}
				onDelete={warehouseStore.openDelete}
				onAdjustStock={warehouseStore.openAdjustStock}
				onTransfer={warehouseStore.openTransfer}
			/>
		</Box>
	);
});

export default WarehousesPage;
