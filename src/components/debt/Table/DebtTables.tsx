import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, DefaultSort } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { Debt } from "models/debt";
import { DebtPartnerGroup } from "stores/DebtStore";

import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

import { buildPartnerDebtColumns, PartnerDebtRowHandlers } from "./partnerDebtTableConfigs";
import { buildTransactionDebtColumns, DebtRow } from "./transactionDebtTableConfigs";

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
	groups: DebtPartnerGroup[];
	anyFilter: boolean;
	onOpen: (group: DebtPartnerGroup) => void;
}

/** By-partner aggregates; the largest exposure first regardless of direction. */
export const PartnerDebtTable: React.FC<PartnerDebtTableProps> = ({
	groups,
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
		<DataTable<DebtPartnerGroup>
			rows={groups}
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
	onOpen: (debt: Debt) => void;
}

/** Flat outstanding documents; a row opens the sale / supply. */
export const TransactionDebtTable: React.FC<TransactionDebtTableProps> = ({
	rows,
	anyFilter,
	defaultSort,
	onOpen,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(() => buildTransactionDebtColumns(t), [t]);
	const dataRows = useMemo<DebtRow[]>(
		() => rows.map((d) => ({ ...d, id: d.transactionId })),
		[rows],
	);

	return (
		<DataTable<DebtRow>
			rows={dataRows}
			columns={columns}
			defaultSort={defaultSort}
			onRowClick={onOpen}
			empty={<DebtEmptyState anyFilter={anyFilter} />}
		/>
	);
};
