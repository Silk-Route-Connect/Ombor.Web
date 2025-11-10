import React from "react";
import PayrollActionMenu from "components/payroll/Table/ActionMenu/PayrollActionMenu";
import { PAYROLL_COLUMNS, PayrollColumnKey } from "components/payroll/Table/payrollTableConfig";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import { Column, SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { Payment } from "models/payment";

const FULL_MODE_COLUMNS: readonly PayrollColumnKey[] = [
	"paymentId",
	"employeeName",
	"date",
	"amount",
	"currency",
	"method",
	"notes",
];

const COMPACT_MODE_COLUMNS: readonly PayrollColumnKey[] = [
	"paymentId",
	"date",
	"amount",
	"currency",
	"method",
];

export const getPayrollColumns = (mode: "full" | "compact"): Column<Payment>[] => {
	const columnKeys = mode === "compact" ? COMPACT_MODE_COLUMNS : FULL_MODE_COLUMNS;
	return columnKeys.map((key) => PAYROLL_COLUMNS[key]);
};

interface PayrollTableProps {
	data: Loadable<Payment[]>;
	pagination?: boolean;
	mode?: "full" | "compact";

	onSort?: (field: keyof Payment, order: SortOrder) => void;
	onEdit?: (payment: Payment) => void;
	onDelete?: (payment: Payment) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
	data: rows,
	pagination = true,
	mode = "full",
	onSort,
	onEdit,
	onDelete,
}) => {
	const baseColumns = getPayrollColumns(mode);

	const columns: Column<Payment>[] =
		onEdit && onDelete
			? [
					...baseColumns,
					{
						key: "actions",
						headerName: "",
						width: 80,
						renderCell: (payment: Payment) => (
							<PayrollActionMenu
								onEdit={() => onEdit(payment)}
								onDelete={() => onDelete(payment)}
							/>
						),
					},
				]
			: baseColumns;

	return (
		<DataTable<Payment> rows={rows} columns={columns} pagination={pagination} onSort={onSort} />
	);
};

export default PayrollTable;
