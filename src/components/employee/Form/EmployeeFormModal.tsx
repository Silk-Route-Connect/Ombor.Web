import React from "react";
import EmployeeFormFields from "components/employee/Form/EmployeeFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormSheet from "components/shared/Dialog/FormSheet/FormSheet";
import { EmployeeFormPayload, useEmployeeForm } from "hooks/employee/useEmployeeForm";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { dialogTranslation } from "utils/translationUtils";

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
		useEmployeeForm({ isOpen, isSaving, employee, onSave, onClose });

	const title = employee ? translate("employee.editTitle") : translate("employee.createTitle");

	return (
		<>
			<FormSheet
				open={isOpen}
				title={title}
				subtitle={employee?.name}
				isSaving={isSaving}
				canSave={canSave}
				width={560}
				onClose={requestClose}
				onSave={submit}
			>
				<EmployeeFormFields form={form} disabled={isSaving} />
			</FormSheet>

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
