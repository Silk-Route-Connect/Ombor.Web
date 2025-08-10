import React, { useMemo } from "react";
import {
	ExpandableDataTable,
	ExpandableDataTableProps,
	SortOrder,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { TransactionRecord } from "models/transaction";

import TransactionLinesTable from "./LinesTable/TransactionLinesTable";
import TransactionMenuCell from "./MenuCell/TransactionMenuCell";
import { TransactionColumn, TransactionColumnBuilders } from "./transactionColumns";

export type TableMode = "full" | "compact";

interface TransactionsTableProps
	extends Omit<ExpandableDataTableProps<TransactionRecord>, "columns" | "onSort" | "rows"> {
	rows: ExpandableDataTableProps<TransactionRecord>["rows"];
	mode?: TableMode;
	excludeColumns?: TransactionColumn[];
	onSort?: (field: keyof TransactionRecord | "unpaidAmount", order: SortOrder) => void;
	onPayment?: (transaction: TransactionRecord) => void;
	onRefund?: (transaction: TransactionRecord) => void;
}

const DEFAULT_COMPACT_HIDE: TransactionColumn[] = ["partnerName", "unpaidAmount"];

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
	mode = "full",
	excludeColumns,
	rows,
	pagination = true,
	rowsPerPageOptions,
	className,
	expandedMaxHeight,
	onRowClick,
	onSort,
	canExpand,
	onPayment,
	onRefund,
}) => {
	const hiddenColumns = useMemo(() => {
		const base = mode === "compact" ? DEFAULT_COMPACT_HIDE : [];
		return new Set<TransactionColumn>([...base, ...(excludeColumns ?? [])]);
	}, [mode, excludeColumns]);

	const columns = useMemo(() => {
		const columnsToDisplay = (Object.keys(TransactionColumnBuilders) as TransactionColumn[])
			.filter((key) => !hiddenColumns.has(key))
			.map((key) => TransactionColumnBuilders[key](mode));

		if (mode === "full" && onPayment && onRefund) {
			columnsToDisplay.push({
				key: "menu",
				width: "70px",
				headerName: "",
				renderCell: (transaction) => (
					<TransactionMenuCell
						fullyPaid={transaction.status === "Open"}
						onPayment={() => onPayment(transaction)}
						onRefund={() => onRefund(transaction)}
					/>
				),
			});
		}

		return [...columnsToDisplay];
	}, [mode, hiddenColumns, onSort]);

	return (
		<ExpandableDataTable<TransactionRecord>
			rows={rows}
			columns={columns}
			onSort={onSort}
			pagination={pagination}
			rowsPerPageOptions={rowsPerPageOptions}
			onRowClick={onRowClick}
			renderExpanded={(transaction) => <TransactionLinesTable lines={transaction.lines} />}
			canExpand={canExpand}
			className={className}
			expandedMaxHeight={expandedMaxHeight}
			tableLayout="fixed"
		/>
	);
};
