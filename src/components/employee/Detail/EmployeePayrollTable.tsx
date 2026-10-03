import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import WalletLink from "components/wallet/Links/WalletLink";
import { PaymentRecord } from "models/payment";
import { paymentDetailPath } from "routing/paths";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue, formatOptionalNumber } from "utils/formatEntityId";
import { paymentMoneyTone } from "utils/paymentUtils";
import { formatPeriod } from "utils/payrollUtils";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

interface EmployeePayrollTableProps {
	employeeName: string;
	payments: PaymentRecord[];
	/** The period filter (segmented) rendered in the card band. */
	filters: React.ReactNode;
	onOpen: (payment: PaymentRecord) => void;
}

/**
 * The employee's salary payouts — № · Дата · Период · Касса · Сумма — each row
 * opening its payment. Payouts are immutable payments, so there are no actions.
 */
export const EmployeePayrollTable: React.FC<EmployeePayrollTableProps> = ({
	employeeName,
	payments,
	filters,
	onOpen,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<PaymentRecord>[]>(
		() => [
			{
				key: "number",
				headerName: t("employee.payroll.number"),
				sortValue: (p) => entityNumberSortValue(p.number),
				renderCell: (p) => <DocNumberCell number={p.number} to={paymentDetailPath(p.id)} />,
			},
			{
				key: "date",
				headerName: t("employee.payroll.date"),
				sortValue: (p) => Date.parse(p.date),
				renderCell: (p) => <DateCell value={p.date} />,
			},
			{
				key: "period",
				headerName: t("employee.payroll.period"),
				sortValue: (p) => p.period ?? p.date,
				renderCell: (p) => <MutedTextCell text={formatPeriod(t, p.period ?? p.date)} />,
			},
			{
				key: "wallet",
				headerName: t("employee.payroll.wallet"),
				sortValue: (p) => p.walletName ?? "",
				renderCell: (p) =>
					p.walletName ? <WalletLink id={p.walletId} name={p.walletName} /> : <NoValue />,
			},
			{
				key: "amount",
				headerName: t("employee.payroll.amount"),
				align: "right",
				sortValue: (p) => p.amount,
				renderCell: (p) => <MoneyCell value={p.amount} main tone={paymentMoneyTone(p.direction)} />,
			},
		],
		[t],
	);

	const handleExport = () => {
		exportToCsv<PaymentRecord>(
			`employee_${employeeName}_payroll_${csvDateStamp()}`,
			[
				{
					header: t("employee.payroll.number"),
					value: (p) => formatOptionalNumber(p.number, t("common.noNumber")),
				},
				{ header: t("employee.payroll.date"), value: (p) => formatDate(p.date) },
				{ header: t("employee.payroll.period"), value: (p) => formatPeriod(t, p.period ?? p.date) },
				{ header: t("employee.payroll.wallet"), value: (p) => p.walletName ?? "" },
				{ header: t("employee.payroll.amount"), value: (p) => p.amount },
			],
			payments,
		);
	};

	return (
		<DetailTableCard
			filters={filters}
			exportCsv={{ onExport: handleExport, rowCount: payments.length }}
		>
			<DetailTable<PaymentRecord>
				rows={payments}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={onOpen}
				empty={
					<TableEmptyState
						icon={<PaymentsOutlinedIcon />}
						title={t("employee.payrollEmptyTitle")}
						hint={t("employee.payrollEmptyBody")}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default EmployeePayrollTable;
