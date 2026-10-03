import React from "react";
import { useTranslation } from "react-i18next";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState, { archiveListEmptyKind } from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Warehouse } from "models/warehouse";

import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

interface WarehousesTableProps {
	rows: Loadable<Warehouse[]>;
	columns: Column<Warehouse>[];
	/** True when a search narrows the view (drives the empty-state copy). */
	isFiltering: boolean;
	/** Whether any warehouse exists at all (drives the empty-state copy). */
	hasAny: boolean;
	/** Whether any active (non-archived) warehouse exists. */
	hasActive: boolean;
	showArchived: boolean;
	onOpen: (warehouse: Warehouse) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить склады». */
	errorTitle: string;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Warehouse>;
}

/**
 * Warehouse list on the shared DataTable. The list-level totals live in the
 * summary strip above the table.
 */
export const WarehousesTable: React.FC<WarehousesTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	columns,
	isFiltering,
	hasAny,
	hasActive,
	showArchived,
	onOpen,
	onCreate,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const kind = archiveListEmptyKind({ isFiltering, hasAny, hasActive, showArchived });
	const copy = {
		filtering: { title: t("warehouse.empty.searchTitle"), hint: t("warehouse.empty.searchBody") },
		empty: { title: t("warehouse.empty.title"), hint: t("warehouse.empty.body") },
		allArchived: {
			title: t("warehouse.empty.allArchivedTitle"),
			hint: t("warehouse.empty.allArchivedBody"),
		},
	}[kind];

	return (
		<DataTable<Warehouse>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
			empty={
				<TableEmptyState
					icon={<WarehouseOutlinedIcon />}
					title={copy.title}
					hint={copy.hint}
					action={
						kind === "empty" ? { label: t("warehouse.create"), onClick: onCreate } : undefined
					}
				/>
			}
		/>
	);
};

export default WarehousesTable;
