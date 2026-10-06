import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Employee } from "models/employee";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import { employeeManageActions, EmployeeManageHandlers } from "../../employeeActions";

interface EmployeeActionMenuProps extends EmployeeManageHandlers {
	employee: Employee;
	onPay: () => void;
}

/** Row actions for an employee: «Выплатить» (not terminated), then the shared manage rows. */
const EmployeeActionMenu: React.FC<EmployeeActionMenuProps> = ({
	employee,
	onPay,
	...handlers
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [];
	if (employee.status !== "Terminated") {
		actions.push({
			key: "pay",
			label: t("employee.action.pay"),
			icon: <PaymentsOutlinedIcon fontSize="small" />,
			onClick: onPay,
		});
	}
	actions.push(...employeeManageActions(t, employee, handlers));

	return <ActionMenu actions={actions} />;
};

export default EmployeeActionMenu;
