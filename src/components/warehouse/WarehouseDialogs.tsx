import React from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import AdjustStockDialog from "components/warehouse/AdjustStock/AdjustStockDialog";
import WarehouseFormDialog from "components/warehouse/Form/WarehouseFormDialog";
import TransferStockDialog from "components/warehouse/TransferStock/TransferStockDialog";
import { AdjustStockFormPayload } from "hooks/warehouse/useAdjustStockForm";
import { WarehouseFormPayload } from "hooks/warehouse/useWarehouseForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

/**
 * All warehouse mutation dialogs (create/edit, adjust stock, transfer, delete),
 * driven by the shared `warehouseStore.dialogMode`. Rendered by both the
 * warehouse list and the warehouse detail page so either can trigger them.
 */
const WarehouseDialogs: React.FC = observer(() => {
	const { warehouseStore, selectedWarehouseStore } = useStore();
	const dialogMode = warehouseStore.dialogMode;

	const handleFormSave = (payload: WarehouseFormPayload) => {
		const warehouse = dialogMode.kind === "form" ? dialogMode.warehouse : null;
		if (warehouse) {
			// Active state is managed via archive/restore, not this form.
			warehouseStore.update({ id: warehouse.id, ...payload, isActive: warehouse.isActive });
		} else {
			// New warehouses are always created active.
			warehouseStore.create({ ...payload, isActive: true });
		}
	};

	const handleAdjustStockSave = (payload: AdjustStockFormPayload) => {
		const warehouse = dialogMode.kind === "adjustStock" ? dialogMode.warehouse : null;
		if (warehouse) {
			selectedWarehouseStore.adjustStock({ warehouseId: warehouse.id, ...payload });
		}
	};

	const handleDeleteConfirmed = () => {
		const warehouse = dialogMode.kind === "delete" ? dialogMode.warehouse : null;
		if (warehouse) {
			warehouseStore.delete(warehouse.id);
		}
	};

	return (
		<>
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
		</>
	);
});

export default WarehouseDialogs;
