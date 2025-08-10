import React, { useEffect } from "react";
import { Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";
import ConfirmDialog from "components/shared/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { TemplateFormPayload, useTemplateForm } from "hooks/templates/useTemplateForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

import TemplateFormFields from "./TemplateFormFields";

const CONTENT_HEIGHT = 560;

interface Props {
	isOpen: boolean;
	isSaving: boolean;
	template?: Template | null;
	onClose: () => void;
	onSave: (payload: TemplateFormPayload) => void;
}

const TemplateFormModal: React.FC<Props> = ({ isOpen, isSaving, template, onClose, onSave }) => {
	const { partnerStore, productStore } = useStore();

	const templateForm = useTemplateForm({
		isOpen,
		isSaving,
		template,
		onSave,
		onClose,
	});

	const { canSave, submit } = templateForm;
	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		templateForm.formState.isDirty,
		isSaving,
		onClose,
	);

	useEffect(() => {
		if (isOpen) {
			partnerStore.getAll();
			productStore.getAll();
		}
	}, [isOpen, partnerStore, productStore]);

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
					title={translate(template ? "editTemplateTitle" : "createTemplateTitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ maxHeight: CONTENT_HEIGHT, overflowY: "auto" }}>
					<TemplateFormFields form={templateForm} />
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
				title={translate("unsavedChangesTitle")}
				content={<Typography>{translate("unsavedChangesContent")}</Typography>}
				confirmLabel={translate("common.dialog.discardChanges.confirm")}
				cancelLabel={translate("common.dialog.discardChanges.cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default observer(TemplateFormModal);
