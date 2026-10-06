import React from "react";
import { useTranslation } from "react-i18next";
import EmployeeFormFields from "components/employee/Form/EmployeeFormFields";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import { EmployeeFormPayload, useEmployeeForm } from "hooks/employee/useEmployeeForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { Employee } from "models/employee";

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
	const { t } = useTranslation();
	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		useEmployeeForm({
			isOpen,
			isSaving,
			employee,
			onSave,
			onClose,
		});

	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);

	return (
		<FormDialog
			open={isOpen}
			size="md"
			title={employee ? t("employee.editTitle") : t("employee.createTitle")}
			subtitle={employee?.name}
			tile={recordTile("Employee")}
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
					submitLabel={employee ? undefined : t("employee.form.submitCreate")}
				/>
			}
		>
			<EmployeeFormFields form={form} disabled={isSaving} />
		</FormDialog>
	);
};

export default EmployeeFormModal;
