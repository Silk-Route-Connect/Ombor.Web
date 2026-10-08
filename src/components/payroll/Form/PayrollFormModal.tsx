import React from "react";
import { useTranslation } from "react-i18next";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { PayrollFormMode, PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { observer } from "mobx-react-lite";
import { formatCurrency } from "utils/formatCurrency";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Typography } from "@mui/material";

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
			<FormDialog
				open={isOpen}
				size="md"
				title={title}
				tile={recordTile("Payroll")}
				busy={isSaving}
				onClose={requestClose}
				onKeyDown={onKeyDown}
				discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
				footer={
					<FormDialogFooter
						onCancel={requestClose}
						onSave={submit}
						canSave={canSave}
						loading={isSaving}
						submitLabel={t("payroll.form.submit")}
						submitIcon={<PaymentsOutlinedIcon />}
						commitNote={t("payroll.form.commitNote")}
					/>
				}
			>
				{isEmployeeLocked ? (
					<Box mb={2}>
						<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
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
					<FormField label={t("payroll.employee")} required sx={{ mb: 2 }}>
						<EmployeeAutocomplete
							size="small"
							value={selectedEmployee}
							onChange={(e) => setEmployeeId(e?.id ?? 0)}
							required
							error={!!form.formState.errors.employeeId}
							helperText={form.formState.errors.employeeId?.message}
						/>
					</FormField>
				)}
				<PayrollFormFields
					form={form}
					wallets={wallets}
					walletAvailable={walletAvailable}
					salary={selectedEmployee?.salary ?? null}
					disabled={isSaving}
				/>
			</FormDialog>
		);
	},
);

export default PayrollFormModal;
