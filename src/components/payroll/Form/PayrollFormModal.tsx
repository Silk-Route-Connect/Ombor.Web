import React, { useState } from "react";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import { dialogTranslation } from "utils/translationUtils";

import { Box, Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

interface PayrollFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	payment: Payment | null;
	employee: Employee | null;
	onClose: () => void;
	onSave: (payload: PayrollFormPayload, employeeId: number) => Promise<void>;
}

const PayrollFormModal: React.FC<PayrollFormModalProps> = ({
	isOpen,
	isSaving,
	payment,
	employee,
	onClose,
	onSave,
}) => {
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const handleSave = async (payload: PayrollFormPayload) => {
		const employeeId = payment?.employeeId || employee?.id || selectedEmployee?.id;

		if (!employeeId) {
			return;
		}

		await onSave(payload, employeeId);
		setSelectedEmployee(null);
	};

	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		usePayrollForm({
			isOpen,
			isSaving,
			payment,
			onSave: handleSave,
			onClose: () => {
				setSelectedEmployee(null);
				onClose();
			},
		});

	const isEditMode = !!payment;
	const preSelectedEmployee = payment
		? { id: payment.employeeId!, name: payment.employeename!, position: "" }
		: employee;

	const title = isEditMode ? translate("payroll.editTitle") : translate("payroll.createTitle");

	const employeeError = !preSelectedEmployee && !selectedEmployee;
	const canSubmit = canSave && !employeeError;

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
					{preSelectedEmployee ? (
						<Box mb={2}>
							<Typography variant="body2" color="text.secondary">
								{translate("payroll.employeeLabel")}
							</Typography>
							<Typography variant="body1" fontWeight={600}>
								{preSelectedEmployee.name}
								{preSelectedEmployee.position && ` • ${preSelectedEmployee.position}`}
							</Typography>
						</Box>
					) : (
						<Box mb={2}>
							<EmployeeAutocomplete
								value={selectedEmployee}
								onChange={setSelectedEmployee}
								required
								error={employeeError && form.formState.isSubmitted}
								helperText={
									employeeError && form.formState.isSubmitted
										? translate("payroll.validation.employeeRequired")
										: undefined
								}
							/>
						</Box>
					)}

					<PayrollFormFields form={form} disabled={isSaving} />
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSubmit}
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
