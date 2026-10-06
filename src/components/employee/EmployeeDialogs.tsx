import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { useStore } from "stores/StoreContext";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

interface EmployeeDialogsProps {
	/** The detail page leaves the deleted employee's page. */
	onDeleted?: (employee: Employee) => void;
}

/**
 * Terminate / restore / delete confirmations driven by `employeeStore.dialogMode`,
 * shared by the list and detail pages. Delete is offered only for a never-paid
 * employee; its body points to «Уволить» for someone who simply left.
 */
const EmployeeDialogs: React.FC<EmployeeDialogsProps> = observer(({ onDeleted }) => {
	const { t } = useTranslation();
	const { employeeStore } = useStore();
	const mode = employeeStore.dialogMode;
	const name =
		mode.kind === "terminate" || mode.kind === "restore" || mode.kind === "delete"
			? mode.employee.name
			: "";

	return (
		<>
			<ConfirmDialog
				isOpen={mode.kind === "terminate"}
				icon={<PersonOffOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("employee.terminate.title", { name })}
				content={t("employee.terminate.body")}
				confirmLabel={t("employee.action.terminate")}
				cancelLabel={t("common.cancel")}
				confirmVariant="danger"
				onCancel={employeeStore.closeDialog}
				onConfirm={() => mode.kind === "terminate" && void employeeStore.terminate(mode.employee)}
			/>

			<ConfirmDialog
				isOpen={mode.kind === "restore"}
				icon={<RestartAltOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("employee.restore.title", { name })}
				content={t("employee.restore.body")}
				confirmLabel={t("employee.action.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={employeeStore.closeDialog}
				onConfirm={() => mode.kind === "restore" && void employeeStore.restore(mode.employee)}
			/>

			<ConfirmDialog
				isOpen={mode.kind === "delete"}
				icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("employee.delete.title", { name })}
				content={t("employee.delete.body")}
				confirmLabel={t("common.delete")}
				cancelLabel={t("common.cancel")}
				confirmVariant="danger"
				onCancel={employeeStore.closeDialog}
				onConfirm={() => {
					if (mode.kind === "delete") {
						const employee = mode.employee;
						void employeeStore.delete(employee).then((ok) => ok && onDeleted?.(employee));
					}
				}}
			/>
		</>
	);
});

export default EmployeeDialogs;
