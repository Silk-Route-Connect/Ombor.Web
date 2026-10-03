import React from "react";
import { useTranslation } from "react-i18next";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PayrollFormMode, PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { observer } from "mobx-react-lite";
import { formatCurrency } from "utils/formatCurrency";
import { dialogTranslation } from "utils/translationUtils";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";

interface PayrollFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	mode: PayrollFormMode;
	onClose: () => void;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
}

// observer: the wallet «Касса» picker sources `walletStore.allWallets`, which loads
// when the modal opens — without observer the modal wouldn't re-render once the
// wallets arrive, leaving the picker disabled (F-020).
const PayrollFormModal: React.FC<PayrollFormModalProps> = observer(
	({ isOpen, isSaving, mode, onClose, onSave }) => {
		const { t } = useTranslation();
		const {
			form,
			canSave,
			submit,
			requestClose,
			discardOpen,
			confirmDiscard,
			cancelDiscard,
			wallets,
			walletAvailable,
			selectedEmployee,
			setEmployeeId,
			isEmployeeLocked,
		} = usePayrollForm({
			isOpen,
			isSaving,
			mode,
			onSave,
			onClose,
		});

		const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });

		const title = selectedEmployee
			? t("payroll.createTitleFor", { name: selectedEmployee.name })
			: t("payroll.createTitle");

		return (
			<>
				<Dialog
					open={isOpen}
					onClose={requestClose}
					maxWidth="sm"
					fullWidth
					disableEscapeKeyDown={isSaving}
					disableRestoreFocus
					onKeyDown={onKeyDown}
				>
					<FormDialogHeader title={title} onClose={requestClose} disabled={isSaving} />

					{isSaving && (
						<Box sx={{ position: "relative", height: 4 }}>
							<LinearProgress sx={{ position: "absolute", inset: 0 }} />
						</Box>
					)}

					<DialogContent dividers sx={{ pt: 2 }}>
						{isEmployeeLocked ? (
							<Box mb={2}>
								<Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
									{[
										selectedEmployee?.position,
										selectedEmployee &&
											t("payroll.form.salaryLine", {
												amount: formatCurrency(selectedEmployee.salary),
											}),
									]
										.filter(Boolean)
										.join(" · ")}
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
						<PayrollFormFields
							form={form}
							wallets={wallets}
							walletAvailable={walletAvailable}
							disabled={isSaving}
						/>
					</DialogContent>

					<FormDialogFooter
						onCancel={requestClose}
						onSave={submit}
						canSave={canSave}
						loading={isSaving}
						submitLabel={t("payroll.form.submit")}
						submitIcon={<PaymentsOutlinedIcon />}
						commitNote={t("payroll.form.commitNote")}
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
	},
);

export default PayrollFormModal;
