import React from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useWarehouseForm, WarehouseFormPayload } from "hooks/warehouse/useWarehouseForm";
import { translate } from "i18n/i18n";
import { Warehouse } from "models/warehouse";

import { Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

import WarehouseFormFields from "./WarehouseFormFields";

const CONTENT_HEIGHT = 400;

interface Props {
	isOpen: boolean;
	isSaving: boolean;
	warehouse?: Warehouse | null;
	onClose: () => void;
	onSave: (payload: WarehouseFormPayload) => void;
}

const WarehouseFormDialog: React.FC<Props> = ({ isOpen, isSaving, warehouse, onClose, onSave }) => {
	const warehouseForm = useWarehouseForm({
		isOpen,
		isSaving,
		warehouse,
		onSave,
	});

	const { canSave, submit } = warehouseForm;
	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		warehouseForm.formState.isDirty,
		isSaving,
		onClose,
	);

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				fullWidth
				maxWidth="sm"
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
			>
				<FormDialogHeader
					title={translate(
						warehouse ? "warehouse.dialog.editTitle" : "warehouse.dialog.createTitle",
					)}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ maxHeight: CONTENT_HEIGHT, overflowY: "auto" }}>
					<WarehouseFormFields form={warehouseForm} />
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
};

export default WarehouseFormDialog;
