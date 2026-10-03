import React from "react";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EmployeeLink from "components/employee/Link/EmployeeLink";
import EmployeeActionMenu from "components/employee/Table/ActionMenu/EmployeeActionMenu";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import DateCell from "components/shared/Table/cells/DateCell";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TFunction } from "i18next";
import { Employee } from "models/employee";

export interface EmployeeColumnHandlers {
	onPay: (employee: Employee) => void;
	onEdit: (employee: Employee) => void;
	onTerminate: (employee: Employee) => void;
	onRestore: (employee: Employee) => void;
}

/**
 * Employee list columns in the canonical order (conventions.md → Tables):
 * Сотрудник · Статус · Должность · Дата найма · Зарплата · ⋮. A terminated
 * employee reads muted (the status chip says why).
 */
export function buildEmployeeColumns(
	t: TFunction,
	handlers: EmployeeColumnHandlers,
): Column<Employee>[] {
	return [
		{
			key: "name",
			headerName: t("employee.table.employee"),
			sortValue: (e) => e.name,
			renderCell: (e) => {
				const terminated = e.status === "Terminated";
				return (
					<EntityCell avatar={<EntityAvatar name={e.name} muted={terminated} />}>
						<EmployeeLink id={e.id} name={e.name} archived={terminated} />
					</EntityCell>
				);
			},
		},
		{
			key: "status",
			headerName: t("employee.status"),
			sortValue: (e) => t(`employee.status.${e.status}`),
			renderCell: (e) => <EmployeeStatusBadge status={e.status} />,
		},
		{
			key: "position",
			headerName: t("employee.position"),
			sortValue: (e) => e.position,
			renderCell: (e) => <MutedTextCell text={e.position} />,
		},
		{
			key: "dateOfEmployment",
			headerName: t("employee.dateOfEmployment"),
			sortValue: (e) => e.dateOfEmployment,
			renderCell: (e) => <DateCell value={e.dateOfEmployment} kind="date" />,
		},
		{
			key: "salary",
			headerName: t("employee.table.salary"),
			align: "right",
			sortValue: (e) => e.salary,
			renderCell: (e) => <MoneyCell value={e.salary} main />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
			renderCell: (e) => (
				<EmployeeActionMenu
					employee={e}
					onPay={() => handlers.onPay(e)}
					onEdit={() => handlers.onEdit(e)}
					onTerminate={() => handlers.onTerminate(e)}
					onRestore={() => handlers.onRestore(e)}
				/>
			),
		},
	];
}
