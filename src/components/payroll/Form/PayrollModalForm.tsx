import React from "react";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { dialogTranslation } from "utils/translationUtils";

import { Box, Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

interface PayrollModalProps {
	isOpen: boolean;
	isSaving: boolean;
	employee: Employee | null;
	onClose: () => void;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
}

const PayrollModal: React.FC<PayrollModalProps> = ({
	isOpen,
	isSaving,
	employee,
	onClose,
	onSave,
}) => {
	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		usePayrollForm({
			isOpen,
			isSaving,
			onSave,
			onClose,
		});

	if (!employee) {
		return null;
	}

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
				<FormDialogHeader
					title={translate("payroll.title")}
					onClose={requestClose}
					disabled={isSaving}
				/>

				{isSaving && (
					<Box sx={{ position: "relative", height: 4 }}>
						<LinearProgress sx={{ position: "absolute", inset: 0 }} />
					</Box>
				)}

				<DialogContent dividers sx={{ pt: 2 }}>
					<Box mb={2}>
						<Typography variant="body2" color="text.secondary">
							{translate("payroll.employeeLabel")}
						</Typography>
						<Typography variant="body1" fontWeight={600}>
							{employee.name} • {employee.position}
						</Typography>
					</Box>

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

export default PayrollModal;
