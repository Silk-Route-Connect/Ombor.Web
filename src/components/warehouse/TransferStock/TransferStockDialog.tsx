import React, { useEffect } from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import {
	StockTransferFormPayload,
	useStockTransferForm,
} from "hooks/warehouse/useStockTransferForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { useStore } from "stores/StoreContext";

import { Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

import TransferStockFields from "./TransferStockFields";

const CONTENT_HEIGHT = 600;

interface Props {
	isOpen: boolean;
	isSaving: boolean;
	fromWarehouse: Warehouse | null;
	onClose: () => void;
}

const TransferStockDialog: React.FC<Props> = observer(
	({ isOpen, isSaving, fromWarehouse, onClose }) => {
		const { warehouseStore, productStore, stockTransferStore } = useStore();

		useEffect(() => {
			if (isOpen) {
				productStore.getAll();
			}
		}, [isOpen, productStore]);

		const warehouses =
			warehouseStore.allWarehouses === "loading" ? [] : warehouseStore.allWarehouses;

		const handleSave = (payload: StockTransferFormPayload) => {
			stockTransferStore.create(payload);
			onClose();
		};

		const transferForm = useStockTransferForm({
			isOpen,
			isSaving,
			warehouses,
			onSave: handleSave,
		});

		const { canSave, submit } = transferForm;
		const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
			transferForm.formState.isDirty,
			isSaving,
			onClose,
		);

		const { setFromWarehouseId } = transferForm;

		useEffect(() => {
			if (isOpen && fromWarehouse) {
				console.log("calling set from");
				setFromWarehouseId(fromWarehouse.id);
			}
		}, [isOpen, fromWarehouse, setFromWarehouseId]);

		return (
			<>
				<Dialog
					open={isOpen}
					onClose={requestClose}
					fullWidth
					maxWidth="md"
					disableEscapeKeyDown={isSaving}
					disableRestoreFocus
				>
					<FormDialogHeader
						title={translate("warehouse.transferStock.title")}
						disabled={isSaving}
						onClose={requestClose}
					/>

					{isSaving && <LinearProgress />}

					<DialogContent dividers sx={{ maxHeight: CONTENT_HEIGHT, overflowY: "auto" }}>
						<TransferStockFields
							form={transferForm}
							warehouses={warehouses}
							canChangeSourceWarehouse={!fromWarehouse}
						/>
					</DialogContent>

					<FormDialogFooter
						onCancel={requestClose}
						onSave={submit}
						canSave={canSave}
						loading={isSaving}
					/>
				</Dialog>

				<ConfirmDialog
					isOpen={discardOpen}
					title={translate("common.dialog.discardChanges.title")}
					content={<Typography>{translate("common.dialog.discardChanges.body")}</Typography>}
					confirmLabel={translate("common.dialog.discardChanges.confirm")}
					cancelLabel={translate("common.dialog.discardChanges.cancel")}
					onConfirm={confirmDiscard}
					onCancel={cancelDiscard}
				/>
			</>
		);
	},
);

export default TransferStockDialog;
