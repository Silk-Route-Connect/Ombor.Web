import React from "react";
import { DataTable, SortOrder } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Product } from "models/product";

import ProductActionMenu from "./ProductActionMenu";
import { productColumns } from "./productsTableConfigs";

interface ProductsTableProps {
	data: Loadable<Product[]>;
	pagination: boolean;

	onSort: (field: keyof Product, order: SortOrder) => void;
	onViewDetails: (product: Product) => void;
	onEdit: (product: Product) => void;
	onArchive: (product: Product) => void;
	onDelete: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
	data,
	pagination,
	onSort,
	onViewDetails,
	onEdit,
	onArchive,
	onDelete,
}) => {
	const columns = [
		...productColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (product: Product) => (
				<ProductActionMenu
					onEdit={() => onEdit(product)}
					onDelete={() => onDelete(product)}
					onArchive={() => onArchive(product)}
				/>
			),
		},
	];

	return (
		<DataTable<Product>
			rows={data}
			columns={columns}
			pagination={pagination}
			onSort={onSort}
			onRowClick={onViewDetails}
		/>
	);
};

export default ProductsTable;
