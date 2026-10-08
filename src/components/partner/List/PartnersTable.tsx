import React from "react";
import { useTranslation } from "react-i18next";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Partner } from "models/partner";

import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";

interface PartnersTableProps {
	rows: Loadable<Partner[]>;
	columns: Column<Partner>[];
	/** True when a search/type filter narrows the view (drives empty-state copy). */
	isFiltering: boolean;
	/** True when at least one active (non-archived) partner exists. */
	hasActive: boolean;
	showArchived: boolean;
	onOpen: (partner: Partner) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить партнёров». */
	errorTitle: string;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Partner>;
}

/** Partner list table: shared DataTable with first-run / filtered empty states. */
export const PartnersTable: React.FC<PartnersTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	columns,
	isFiltering,
	hasActive,
	showArchived,
	onOpen,
	onCreate,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const firstRun = !isFiltering && !hasActive && !showArchived;

	return (
		<DataTable<Partner>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
			empty={
				<TableEmptyState
					icon={<HandshakeOutlinedIcon />}
					title={firstRun ? t("partner.empty.title") : t("partner.empty.searchTitle")}
					hint={firstRun ? t("partner.empty.body") : t("partner.empty.searchBody")}
					action={firstRun ? { label: t("partner.list.create"), onClick: onCreate } : undefined}
				/>
			}
		/>
	);
};

export default PartnersTable;
