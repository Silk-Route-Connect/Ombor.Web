import React from "react";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";
import { Employee } from "models/employee";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

export interface EmployeeManageHandlers {
	onEdit: () => void;
	onTerminate: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

/**
 * «Редактировать», «Уволить» / «Восстановить» and — for a never-paid employee
 * only — «Удалить», shared by the list row menu and the detail kebab. A paid
 * employee is named by immutable payroll, so instead of a delete they get the
 * status «Уволен» (employees have no archive, rule 29).
 */
export function employeeManageActions(
	t: TFunction,
	employee: Employee,
	handlers: EmployeeManageHandlers,
): ActionMenuRow[] {
	const terminated = employee.status === "Terminated";
	const rows: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" />,
			onClick: handlers.onEdit,
		},
		terminated
			? {
					key: "restore",
					label: t("employee.action.restore"),
					tone: "restore",
					dividerBefore: true,
					icon: <RestartAltOutlinedIcon fontSize="small" />,
					onClick: handlers.onRestore,
				}
			: {
					key: "terminate",
					label: t("employee.action.terminate"),
					tone: "danger",
					dividerBefore: true,
					icon: <PersonOffOutlinedIcon fontSize="small" />,
					onClick: handlers.onTerminate,
				},
	];
	if (employee.isDeletable) {
		rows.push({
			key: "delete",
			label: t("common.delete"),
			tone: "danger",
			icon: <DeleteOutlineIcon fontSize="small" />,
			onClick: handlers.onDelete,
		});
	}
	return rows;
}
