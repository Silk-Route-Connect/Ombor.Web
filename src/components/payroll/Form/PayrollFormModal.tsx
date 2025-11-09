import React from "react";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PayrollFormMode, PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { dialogTranslation } from "utils/translationUtils";

import { Box, Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

interface PayrollFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	mode: PayrollFormMode;
	onClose: () => void;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
}

const PayrollFormModal: React.FC<PayrollFormModalProps> = ({
	isOpen,
	isSaving,
	mode,
	onClose,
	onSave,
}) => {
	const {
		form,
		canSave,
		submit,
		requestClose,
		discardOpen,
		confirmDiscard,
		cancelDiscard,
		selectedEmployee,
		setEmployeeId,
		isEditMode,
		isEmployeeLocked,
	} = usePayrollForm({
		isOpen,
		isSaving,
		mode,
		onSave,
		onClose,
	});

	const title = isEditMode ? translate("payroll.editTitle") : translate("payroll.createTitle");

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				maxWidth="sm"
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
					{isEmployeeLocked && selectedEmployee ? (
						<Box mb={2}>
							<Typography variant="body2" color="text.secondary">
								{translate("payroll.employee")}
							</Typography>
							<Typography variant="body1" fontWeight={600}>
								{selectedEmployee.name}
								{selectedEmployee.position && ` • ${selectedEmployee.position}`}
							</Typography>
						</Box>
					) : (
						<Box mb={2}>
							<EmployeeAutocomplete
								value={selectedEmployee}
								onChange={(e) => setEmployeeId(e?.id ?? 0)}
								required
								error={!!form.formState.errors.employeeId}
								helperText={form.formState.errors.employeeId?.message}
							/>
						</Box>
					)}

					<PayrollFormFields form={form} disabled={isSaving} />
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

export default PayrollFormModal;
