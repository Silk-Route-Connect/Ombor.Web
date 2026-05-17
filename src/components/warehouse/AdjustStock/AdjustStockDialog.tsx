import React, { useEffect } from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import AdjustStockFields from "components/warehouse/AdjustStock/AdjustStockFields";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { AdjustStockFormPayload, useAdjustStockForm } from "hooks/warehouse/useAdjustStockForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { useStore } from "stores/StoreContext";

import { Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

const CONTENT_HEIGHT = 600;

interface AdjustStockDialogProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouse: Warehouse | null;
	onClose: () => void;
	onSave: (payload: AdjustStockFormPayload) => void;
}

const AdjustStockDialog: React.FC<AdjustStockDialogProps> = observer(
	({ isOpen, isSaving, warehouse, onClose, onSave }) => {
		const { productStore } = useStore();

		useEffect(() => {
			if (isOpen) {
				productStore.getAll();
			}
		}, [isOpen, productStore]);

		const adjustStockForm = useAdjustStockForm({
			isOpen,
			isSaving,
			warehouse,
			onSave,
		});

		const { canSave, submit } = adjustStockForm;
		const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
			adjustStockForm.formState.isDirty,
			isSaving,
			onClose,
		);

		if (!warehouse) {
			return null;
		}

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
						title={translate("warehouse.adjustStock.title", {
							warehouseName: warehouse.name,
						})}
						disabled={isSaving}
						onClose={requestClose}
					/>

					{isSaving && <LinearProgress />}

					<DialogContent dividers sx={{ maxHeight: CONTENT_HEIGHT, overflowY: "auto" }}>
						<AdjustStockFields form={adjustStockForm} />
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

export default AdjustStockDialog;
