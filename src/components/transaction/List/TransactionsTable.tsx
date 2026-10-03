import React from "react";
import { useTranslation } from "react-i18next";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { Loadable } from "helpers/Loading";
import { TransactionRecord } from "models/transaction";
import { TransactionDirection } from "utils/transactionUtils";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

interface TransactionsTableProps {
	rows: Loadable<TransactionRecord[]>;
	columns: Column<TransactionRecord>[];
	direction: TransactionDirection;
	isFiltering: boolean;
	onOpen: (tx: TransactionRecord) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить продажи». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	columns,
	direction,
	isFiltering,
	onOpen,
	onCreate,
	summary,
}) => {
	const { t } = useTranslation();

	return (
		<DataTable<TransactionRecord>
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
			fixedLayout
			summary={summary}
			empty={
				<TableEmptyState
					icon={<ReceiptLongOutlinedIcon />}
					title={
						isFiltering
							? t("transaction.empty.searchTitle")
							: t(`transaction.empty.title.${direction}`)
					}
					hint={
						isFiltering
							? t(`transaction.empty.searchBody.${direction}`)
							: t(`transaction.empty.body.${direction}`)
					}
					action={
						isFiltering
							? undefined
							: { label: t(`transaction.list.new.${direction}`), onClick: onCreate }
					}
				/>
			}
		/>
	);
};

export default TransactionsTable;
