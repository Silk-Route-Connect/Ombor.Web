import React from "react";
import {
	Column,
	ExpandableDataTable,
	SortOrder,
} from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import StockTransferItemsTable from "components/stockTransfer/Table/StockTransferItemsTable";
import { stockTransferTableColumns } from "components/stockTransfer/Table/stockTransferTableConfig";
import { Loadable } from "helpers/Loading";
import { StockTransfer } from "models/stockTransfer";

interface StockTransferTableProps {
	data: Loadable<StockTransfer[]>;
	onSort: (field: keyof StockTransfer, order: SortOrder) => void;
}

const StockTransferTable: React.FC<StockTransferTableProps> = ({ data: rows, onSort }) => {
	const columns: Column<StockTransfer>[] = [...stockTransferTableColumns];

	return (
		<ExpandableDataTable<StockTransfer>
			tableLayout="fixed"
			rows={rows}
			columns={columns}
			pagination
			onSort={onSort}
			renderExpanded={(transfer) => <StockTransferItemsTable items={transfer.items} />}
		/>
	);
};

export default StockTransferTable;
