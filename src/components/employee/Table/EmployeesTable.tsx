import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Employee } from "models/employee";

import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

import { buildEmployeeColumns, EmployeeColumnHandlers } from "./employeeTableConfigs";

interface EmployeesTableProps extends EmployeeColumnHandlers {
	rows: Loadable<Employee[]>;
	isFiltering: boolean;
	onOpen: (employee: Employee) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить сотрудников». */
	errorTitle: string;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Employee>;
}

/**
 * Employees list on the shared DataTable; each row opens the full-page detail.
 * Row actions: «Выплатить» / «Редактировать» / «Уволить·Восстановить» (a status
 * change, never a hard delete).
 */
export const EmployeesTable: React.FC<EmployeesTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	isFiltering,
	onOpen,
	onCreate,
	onPay,
	onEdit,
	onTerminate,
	onRestore,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildEmployeeColumns(t, { onPay, onEdit, onTerminate, onRestore }),
		[t, onPay, onEdit, onTerminate, onRestore],
	);

	return (
		<DataTable<Employee>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
			empty={
				<TableEmptyState
					icon={<PeopleOutlineIcon />}
					title={isFiltering ? t("employee.empty.searchTitle") : t("employee.empty.title")}
					hint={isFiltering ? t("employee.empty.searchBody") : t("employee.empty.body")}
					action={isFiltering ? undefined : { label: t("employee.create"), onClick: onCreate }}
				/>
			}
		/>
	);
};

export default EmployeesTable;
