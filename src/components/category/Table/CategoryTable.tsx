import React from "react";
import { categoryTableColumns } from "components/category/Table/categoryTableConfigs";
import { ActionCell } from "components/shared/ActionCell/ActionCell";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Category } from "models/category";

interface CategoryTableProps {
	data: Loadable<Category[]>;
	pagination: boolean;
	onSort: (field: keyof Category, order: "asc" | "desc") => void;
	onDelete: (category: Category) => void;
	onEdit: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
	data,
	pagination,
	onSort,
	onDelete,
	onEdit,
}) => {
	const columns: Column<Category>[] = [
		...categoryTableColumns,
		{
			key: "actions",
			headerName: "",
			width: "10%",
			renderCell: (category: Category) => (
				<ActionCell onEdit={() => onEdit(category)} onDelete={() => onDelete(category)} />
			),
		},
	];

	return (
		<DataTable<Category> rows={data} columns={columns} pagination={pagination} onSort={onSort} />
	);
};
