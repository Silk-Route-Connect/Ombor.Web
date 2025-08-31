import React from "react";
import { Column, DataTable, SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { ProductTransaction } from "models/product";

import {
	buildProductTransactionsColumns,
	ProductTransactionsMode,
} from "./productTransactionsTableConfigs";

export interface ProductTransactionsTableProps {
	mode: ProductTransactionsMode;
	data: Loadable<ProductTransaction[]>;
	pagination: boolean;
	onSort?: (field: keyof ProductTransaction, order: SortOrder) => void;
}

const ProductTransactionsTable: React.FC<ProductTransactionsTableProps> = ({
	mode,
	data,
	pagination = true,
	onSort,
}) => {
	const columns: Column<ProductTransaction>[] = buildProductTransactionsColumns(mode);

	return (
		<DataTable<ProductTransaction>
			rows={data}
			columns={columns}
			pagination={pagination}
			onSort={onSort}
		/>
	);
};

export default ProductTransactionsTable;
