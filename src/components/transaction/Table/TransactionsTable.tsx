import React, { useMemo } from "react";
import {
	ExpandableDataTable,
	ExpandableDataTableProps,
	SortOrder,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { TransactionRecord } from "models/transaction";

import { TransactionColumn, transactionColumns } from "./columns";
import { WIDTHS } from "./widths";

export type TableMode = "full" | "compact";

export interface TransactionsTableProps
	extends Omit<ExpandableDataTableProps<TransactionRecord>, "columns" | "onSort" | "rows"> {
	rows: ExpandableDataTableProps<TransactionRecord>["rows"];
	mode?: TableMode;
	excludeColumns?: TransactionColumn[];
	onSort?: (field: keyof TransactionRecord | "unpaidAmount", order: SortOrder) => void;
}

const DEFAULT_COMPACT_HIDE: TransactionColumn[] = ["partnerName", "unpaidAmount", "notes", "menu"];

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
	renderExpanded,
	canExpand,
}) => {
	const hideSet = useMemo(() => {
		const base = mode === "compact" ? DEFAULT_COMPACT_HIDE : [];
		return new Set<TransactionColumn>([...base, ...(excludeColumns ?? [])]);
	}, [mode, excludeColumns]);

	const columns = useMemo(() => {
		const width = WIDTHS[mode];
		return (Object.keys(transactionColumns) as TransactionColumn[])
			.filter((key) => !hideSet.has(key))
			.map((key) => {
				const column = transactionColumns[key](width[key], mode);
				if (onSort) {
					column.sortable = true;
				}

				return column;
			});
	}, [mode, hideSet, onSort]);

	return (
		<ExpandableDataTable<TransactionRecord>
			rows={rows}
			columns={columns}
			onSort={onSort}
			pagination={pagination}
			rowsPerPageOptions={rowsPerPageOptions}
			onRowClick={onRowClick}
			renderExpanded={renderExpanded}
			canExpand={canExpand}
			className={className}
			expandedMaxHeight={expandedMaxHeight}
			tableLayout="fixed"
		/>
	);
};
