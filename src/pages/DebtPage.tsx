import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DebtFilters from "components/debt/DebtFilters";
import DebtSummaryCards from "components/debt/DebtSummaryCards";
import DebtTabs from "components/debt/DebtTabs";
import { PartnerDebtTable, TransactionDebtTable } from "components/debt/Table/DebtTables";
import {
	debtDocumentPath,
	DebtRow,
	toDebtRows,
} from "components/debt/Table/transactionDebtTableConfigs";
import DebtReminderDialog from "components/partner/Reminder/DebtReminderDialog";
import ExportButton from "components/shared/Buttons/ExportButton";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { useTableOrder } from "components/shared/Table/tableOrder";
import TableToolbar from "components/shared/Table/TableToolbar";
import { isLoadError, isReady } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Debt } from "models/debt";
import { partnerDebtPath, partnerStatementPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatOptionalNumber } from "utils/formatEntityId";
import { directionOf, isRefundType } from "utils/transactionUtils";

import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import { Box } from "@mui/material";

const DebtPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { debtStore, debtReminderStore } = useStore();
	const tableOrder = useTableOrder<DebtRow>();

	useEffect(() => {
		debtStore.getAll();
	}, [debtStore]);

	const { summary, allDebts } = debtStore;

	const anyFilter =
		debtStore.searchTerm.trim().length > 0 ||
		debtStore.ageBucket !== "all" ||
		debtStore.onlyOverdue ||
		debtStore.directionFilter !== "all";

	const handleExport = (): void => {
		// The unpaid documents in that tab's sort while it is open; served order from «По партнёрам».
		const rows = tableOrder.apply(toDebtRows(debtStore.transactionRows));
		const columns: CsvColumn<Debt>[] = [
			{
				header: t("debt.txTable.document"),
				value: (d) => formatOptionalNumber(d.number, t("common.noNumber")),
			},
			{ header: t("debt.txTable.date"), value: (d) => formatDate(d.date) },
			{ header: t("debt.txTable.partner"), value: (d) => d.partnerName },
			{
				header: t("debt.txTable.type"),
				value: (d) =>
					t(
						isRefundType(d.transactionType)
							? `transaction.badge.refund.${directionOf(d.transactionType)}`
							: `transaction.badge.base.${directionOf(d.transactionType)}`,
					),
			},
			{ header: t("debt.txTable.ageCsv"), value: (d) => d.ageDays },
			{ header: t("debt.txTable.total"), value: (d) => d.total },
			{ header: t("debt.txTable.paid"), value: (d) => d.paid },
			{ header: t("debt.txTable.remaining"), value: (d) => d.remaining },
		];
		exportToCsv(`debts_${csvDateStamp()}`, columns, rows);
	};

	const openTransaction = (d: Debt): void => {
		void navigate(debtDocumentPath(d));
	};

	return (
		<Box>
			<PageHeader
				title={t("debt.title")}
				icon={RequestQuoteOutlinedIcon}
				subtitle={t("page.intro.debts")}
				actions={
					<ExportButton onExport={handleExport} rowCount={debtStore.transactionRows.length} />
				}
			/>

			{!isReady(summary) || !isReady(allDebts) ? (
				// The totals and the unpaid documents load together; either failing is the page's error.
				<LoadStateView
					state={isLoadError(summary) ? summary : isLoadError(allDebts) ? allDebts : "loading"}
					onRetry={() => void debtStore.getAll()}
					errorTitle={t("debt.error.getAll")}
				/>
			) : (
				<>
					<DebtSummaryCards summary={summary} onCard={debtStore.applyCard} />

					<DebtTabs
						value={debtStore.tab}
						partnersCount={debtStore.partnerRows.length}
						transactionsCount={debtStore.transactionRows.length}
						onChange={debtStore.setTab}
					/>

					<TableToolbar
						search={{
							value: debtStore.searchTerm,
							onChange: debtStore.setSearch,
							placeholder: t("debt.searchPlaceholder"),
						}}
						filters={
							<DebtFilters
								ageBucket={debtStore.ageBucket}
								directionFilter={debtStore.directionFilter}
								onlyOverdue={debtStore.onlyOverdue}
								onAgeChange={debtStore.setAgeBucket}
								onDirectionChange={debtStore.setDirectionFilter}
								onClearOverdue={() => debtStore.setOnlyOverdue(false)}
							/>
						}
					/>

					{debtStore.tab === "partners" ? (
						<PartnerDebtTable
							rows={debtStore.partnerRows}
							anyFilter={anyFilter}
							onOpen={(g) => navigate(partnerDebtPath(g.partnerId))}
							onRemind={(g) => debtReminderStore.open(g.partnerId)}
							onStatement={(g) => navigate(partnerStatementPath(g.partnerId))}
						/>
					) : (
						// Keyed by the preset nonce so any summary-card click re-seeds the
						// table's sort — even re-clicking the same card after a manual
						// header re-sort (defaultSort is initial-state only, and a same-value
						// preset write wouldn't change a value-based key).
						<TransactionDebtTable
							key={debtStore.txPresetNonce}
							rows={debtStore.transactionRows}
							exportOrder={tableOrder}
							anyFilter={anyFilter}
							defaultSort={{ key: debtStore.txPresetSort, order: "desc" }}
							onOpen={openTransaction}
						/>
					)}
				</>
			)}

			<DebtReminderDialog />
		</Box>
	);
});

export default DebtPage;
