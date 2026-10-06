import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, DefaultSort } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Debt } from "models/debt";
import { DebtPartnerRow } from "stores/DebtStore";

import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

import { buildPartnerDebtColumns, PartnerDebtRowHandlers } from "./partnerDebtTableConfigs";
import { buildTransactionDebtColumns, DebtRow, toDebtRows } from "./transactionDebtTableConfigs";

const DebtEmptyState: React.FC<{ anyFilter: boolean }> = ({ anyFilter }) => {
	const { t } = useTranslation();
	return (
		<TableEmptyState
			icon={<ReplayOutlinedIcon />}
			title={anyFilter ? t("debt.empty.filteredTitle") : t("debt.empty.title")}
			hint={anyFilter ? t("debt.empty.filteredBody") : t("debt.empty.body")}
		/>
	);
};

interface PartnerDebtTableProps extends PartnerDebtRowHandlers {
	rows: DebtPartnerRow[];
	anyFilter: boolean;
	onOpen: (row: DebtPartnerRow) => void;
}

/** Served partner positions; the largest exposure first regardless of direction. */
export const PartnerDebtTable: React.FC<PartnerDebtTableProps> = ({
	rows,
	anyFilter,
	onOpen,
	onRemind,
	onStatement,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildPartnerDebtColumns(t, { onRemind, onStatement }),
		[t, onRemind, onStatement],
	);

	return (
		<DataTable<DebtPartnerRow>
			rows={rows}
			columns={columns}
			defaultSort={{ key: "amount", order: "desc" }}
			onRowClick={onOpen}
			empty={<DebtEmptyState anyFilter={anyFilter} />}
		/>
	);
};

interface TransactionDebtTableProps {
	rows: Debt[];
	anyFilter: boolean;
	/** Initial sort — seeded by the summary-card presets («Просрочено» → age). */
	defaultSort: DefaultSort;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<DebtRow>;
	onOpen: (debt: Debt) => void;
}

/** The unpaid documents; a row opens the sale / supply / refund. */
export const TransactionDebtTable: React.FC<TransactionDebtTableProps> = ({
	rows,
	anyFilter,
	defaultSort,
	exportOrder,
	onOpen,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(() => buildTransactionDebtColumns(t), [t]);
	const dataRows = useMemo(() => toDebtRows(rows), [rows]);

	return (
		<DataTable<DebtRow>
			rows={dataRows}
			exportOrder={exportOrder}
			columns={columns}
			defaultSort={defaultSort}
			onRowClick={onOpen}
			empty={<DebtEmptyState anyFilter={anyFilter} />}
		/>
	);
};
