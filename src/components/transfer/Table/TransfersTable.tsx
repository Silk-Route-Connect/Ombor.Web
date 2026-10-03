import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { buildTransferColumns } from "components/transfer/Table/transferTableConfigs";
import { Loadable } from "helpers/Loading";
import { Transfer } from "models/transfer";

import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

interface TransfersTableProps {
	rows: Loadable<Transfer[]>;
	isFiltering: boolean;
	/** Whether any transfer exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onOpen: (transfer: Transfer) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить перемещения». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Transfer>;
}

export const TransfersTable: React.FC<TransfersTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	isFiltering,
	hasAny,
	onOpen,
	onCreate,
	summary,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(() => buildTransferColumns(t, onOpen), [t, onOpen]);
	const firstRun = !hasAny && !isFiltering;

	return (
		<DataTable<Transfer>
			exportOrder={exportOrder}
			rows={rows}
			onRetry={onRetry}
			errorTitle={errorTitle}
			columns={columns}
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
			fixedLayout
			summary={summary}
			empty={
				<TableEmptyState
					icon={<SwapHorizOutlinedIcon />}
					title={firstRun ? t("transfer.empty.title") : t("transfer.empty.searchTitle")}
					hint={firstRun ? t("transfer.empty.body") : t("transfer.empty.searchBody")}
					action={firstRun ? { label: t("transfer.create"), onClick: onCreate } : undefined}
				/>
			}
		/>
	);
};

export default TransfersTable;
