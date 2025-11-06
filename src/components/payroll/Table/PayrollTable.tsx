import React from "react";
import PayrollActionMenu from "components/payroll/Table/ActionMenu/PayrollActionMenu";
import { payrollColumns } from "components/payroll/Table/payrollTableConfig";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import { Column, SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { Payment } from "models/payment";

interface PayrollTableProps {
	data: Loadable<Payment[]>;
	pagination: boolean;

	onSort: (field: keyof Payment, order: SortOrder) => void;
	onEdit: (payment: Payment) => void;
	onDelete: (payment: Payment) => void;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
	data: rows,
	pagination,
	onSort,
	onEdit,
	onDelete,
}) => {
	const columns: Column<Payment>[] = [
		...payrollColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (payment: Payment) => (
				<PayrollActionMenu onEdit={() => onEdit(payment)} onDelete={() => onDelete(payment)} />
			),
		},
	];

	return (
		<DataTable<Payment> rows={rows} columns={columns} pagination={pagination} onSort={onSort} />
	);
};

export default PayrollTable;
