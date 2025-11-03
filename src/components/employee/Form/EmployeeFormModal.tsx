import React from "react";
import EmployeeFormFields from "components/employee/Form/EmployeeFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { EmployeeFormPayload, useEmployeeForm } from "hooks/employee/useEmployeeForm";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { dialogTranslation } from "utils/translationUtils";

import { Box, Dialog, DialogContent, LinearProgress } from "@mui/material";

interface EmployeeFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	employee?: Employee | null;
	onClose: () => void;
	onSave: (payload: EmployeeFormPayload) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
	isOpen,
	isSaving,
	employee,
	onClose,
	onSave,
}) => {
	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		useEmployeeForm({
			isOpen,
			isSaving,
			employee,
			onSave,
			onClose,
		});

	const title = employee ? translate("employee.editTitle") : translate("employee.createTitle");

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				maxWidth="md"
				fullWidth
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
			>
				<FormDialogHeader title={title} onClose={requestClose} disabled={isSaving} />

				{isSaving && (
					<Box sx={{ position: "relative", height: 4 }}>
						<LinearProgress sx={{ position: "absolute", inset: 0 }} />
					</Box>
				)}

				<DialogContent dividers sx={{ pt: 2 }}>
					<EmployeeFormFields form={form} disabled={isSaving} />
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
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default EmployeeFormModal;
