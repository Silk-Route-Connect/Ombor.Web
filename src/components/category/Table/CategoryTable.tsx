import React from "react";
import { ActionCell } from "components/shared/ActionCell/ActionCell";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { Category } from "models/category";

interface CategoryTableProps {
	data: Loadable<Category[]>;
	pagination: boolean;
	onSort: (field: keyof Category, direction: "asc" | "desc") => void;
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
		{
			key: "name",
			field: "name",
			headerName: translate("category.name"),
			width: "30%",
			sortable: true,
		},
		{
			key: "description",
			field: "description",
			headerName: translate("category.description"),
			width: "60%",
			sortable: true,
		},
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
