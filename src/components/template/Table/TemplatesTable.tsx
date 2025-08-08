import React from "react";
import { ActionCell } from "components/shared/ActionCell/ActionCell";
import {
	Column,
	ExpandableDataTable,
	SortOrder,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { Template } from "models/template";

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
			width: "10%",
			renderCell: (template: Template) => (
				<ActionCell onEdit={() => onEdit(template)} onDelete={() => onDelete(template)} />
			),
		},
	];

	return (
		<ExpandableDataTable<Template>
			rows={rows}
			columns={columns}
			pagination
			onSort={onSort}
			renderExpanded={(template) => <TemplateItemsTable items={template.items} />}
		/>
	);
};

export default TemplateTable;
