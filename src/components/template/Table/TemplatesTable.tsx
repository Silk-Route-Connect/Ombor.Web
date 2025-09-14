import React from "react";
import {
	Column,
	ExpandableDataTable,
	SortOrder,
} from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { Template } from "models/template";

import TemplateActionMenu from "../ActionMenu/TemplateActionMenu";
import TemplateItemsTable from "./TemplateItemsTable";
import { templateTableColumns } from "./templateTableConfig";

interface TemplateTableProps {
	data: Loadable<Template[]>;
	onSort: (field: keyof Template, order: SortOrder) => void;
	onEdit: (template: Template) => void;
	onDelete: (template: Template) => void;
}

const TemplateTable: React.FC<TemplateTableProps> = ({ data: rows, onSort, onEdit, onDelete }) => {
	const columns: Column<Template>[] = [
		...templateTableColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (template: Template) => (
				<TemplateActionMenu
					onEdit={() => onEdit(template)}
					onDelete={() => onDelete(template)}
					onArchive={() => {}}
				/>
			),
		},
	];

	return (
		<ExpandableDataTable<Template>
			rows={rows}
			columns={columns}
			pagination
			onSort={onSort}
			tableLayout="fixed"
			renderExpanded={(template) => <TemplateItemsTable items={template.items} />}
		/>
	);
};

export default TemplateTable;
