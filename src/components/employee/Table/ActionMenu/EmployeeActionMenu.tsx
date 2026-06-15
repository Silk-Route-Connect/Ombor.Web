import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Employee } from "models/employee";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

interface EmployeeActionMenuProps {
	employee: Employee;
	onPay: () => void;
	onEdit: () => void;
	onTerminate: () => void;
	onRestore: () => void;
}

/**
 * Row actions for an employee: «Выплатить» (active only), «Редактировать», and
 * «Уволить» / «Восстановить» (a status change, never a hard delete — employees
 * carry a Terminated status, business-rules Employee section).
 */
const EmployeeActionMenu: React.FC<EmployeeActionMenuProps> = ({
	employee,
	onPay,
	onEdit,
	onTerminate,
	onRestore,
}) => {
	const { t } = useTranslation();
	const terminated = employee.status === "Terminated";

	const actions: ActionMenuRow[] = [];

	if (!terminated) {
		actions.push({
			key: "pay",
			label: t("employee.action.pay"),
			icon: <PaymentsOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />,
			onClick: onPay,
		});
	}
	actions.push({
		key: "edit",
		label: t("common.edit"),
		icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
		onClick: onEdit,
	});
	actions.push(
		terminated
			? {
					key: "restore",
					label: t("employee.action.restore"),
					labelColor: "success.main",
					dividerBefore: true,
					icon: <RestartAltOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />,
					onClick: onRestore,
				}
			: {
					key: "terminate",
					label: t("employee.action.terminate"),
					labelColor: "error.main",
					dividerBefore: true,
					icon: <PersonOffOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />,
					onClick: onTerminate,
				},
	);

	return <ActionMenu actions={actions} />;
};

export default EmployeeActionMenu;
