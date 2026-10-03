import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ExpandableDataTable } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Template } from "models/template";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

import TemplateItemsTable from "./TemplateItemsTable";
import { buildTemplateColumns, TemplateColumnHandlers } from "./templateTableConfigs";

interface TemplatesTableProps extends TemplateColumnHandlers {
	rows: Loadable<Template[]>;
	isFiltering: boolean;
	/** Whether any template exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить шаблоны». */
	errorTitle: string;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Template>;
}

/**
 * Templates list on the shared ExpandableDataTable — a row (click, Enter or
 * Space) expands into its line items. A template is a mutable basket, so
 * Edit/Delete live in the shared ⋮ menu.
 */
export const TemplatesTable: React.FC<TemplatesTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	isFiltering,
	hasAny,
	onEdit,
	onDelete,
	onCreate,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildTemplateColumns(t, { onEdit, onDelete }),
		[t, onEdit, onDelete],
	);
	const firstRun = !hasAny && !isFiltering;

	return (
		<ExpandableDataTable<Template>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "name", order: "asc" }}
			renderExpanded={(template) => <TemplateItemsTable template={template} />}
			expandedMaxHeight={480}
			empty={
				<TableEmptyState
					icon={<LayersOutlinedIcon />}
					title={firstRun ? t("template.empty.title") : t("template.empty.searchTitle")}
					hint={firstRun ? t("template.empty.body") : t("template.empty.searchBody")}
					action={firstRun ? { label: t("template.create"), onClick: onCreate } : undefined}
				/>
			}
		/>
	);
};

export default TemplatesTable;
