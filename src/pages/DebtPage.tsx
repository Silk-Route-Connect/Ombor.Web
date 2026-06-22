import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DebtFilters from "components/debt/DebtFilters";
import DebtSummaryCards from "components/debt/DebtSummaryCards";
import { PartnerDebtTable, TransactionDebtTable } from "components/debt/DebtTables";
import DebtTabs from "components/debt/DebtTabs";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { observer } from "mobx-react-lite";
import { Debt } from "models/debt";
import { partnerDetailPath, saleDetailPath, supplyDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, CircularProgress } from "@mui/material";

const DebtPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { debtStore } = useStore();

	useEffect(() => {
		debtStore.getAll();
	}, [debtStore]);

	const loading = debtStore.allDebts === "loading";

	const anyFilter =
		debtStore.searchTerm.trim().length > 0 ||
		debtStore.ageBucket !== "all" ||
		debtStore.onlyOverdue ||
		debtStore.directionFilter !== "all";

	const handleExport = (): void => {
		const rows = debtStore.transactionRows;
		const columns: CsvColumn<Debt>[] = [
			{ header: t("debt.txTable.document"), value: (d) => `#${d.number}` },
			{ header: t("debt.txTable.date"), value: (d) => formatDate(d.date) },
			{
				header: t("debt.txTable.type"),
				value: (d) => t(d.direction === "Receivable" ? "debt.txType.sale" : "debt.txType.supply"),
			},
			{ header: t("debt.txTable.partner"), value: (d) => d.partnerName },
			{ header: t("debt.txTable.total"), value: (d) => d.total },
			{ header: t("debt.txTable.paid"), value: (d) => d.paid },
			{ header: t("debt.txTable.remaining"), value: (d) => d.remaining },
			{ header: t("debt.txTable.ageCsv"), value: (d) => d.ageDays },
		];
		exportToCsv(`debts_${csvDateStamp()}`, columns, rows);
	};

	const openTransaction = (d: Debt): void => {
		const path =
			d.transactionType === "Supply" || d.transactionType === "SupplyRefund"
				? supplyDetailPath(d.transactionId)
				: saleDetailPath(d.transactionId);
		navigate(path);
	};

	return (
		<Box>
			<PageHeader
				title={t("debt.title")}
				subtitle={t("debt.subtitle")}
				actions={
					<GhostButton
						icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
						onClick={handleExport}
					>
						{t("debt.exportCsv")}
					</GhostButton>
				}
			/>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<DebtSummaryCards summary={debtStore.summary} onCard={debtStore.applyCard} />

					<DebtTabs
						value={debtStore.tab}
						partnersCount={debtStore.partnerGroups.length}
						transactionsCount={debtStore.transactionRows.length}
						onChange={debtStore.setTab}
					/>

					<DebtFilters
						tab={debtStore.tab}
						searchTerm={debtStore.searchTerm}
						ageBucket={debtStore.ageBucket}
						directionFilter={debtStore.directionFilter}
						sort={debtStore.sort}
						onlyOverdue={debtStore.onlyOverdue}
						onSearch={debtStore.setSearch}
						onAgeChange={debtStore.setAgeBucket}
						onDirectionChange={debtStore.setDirectionFilter}
						onSortChange={debtStore.setSort}
						onClearOverdue={() => debtStore.setOnlyOverdue(false)}
					/>

					{debtStore.tab === "partners" ? (
						<PartnerDebtTable
							groups={debtStore.partnerGroups}
							anyFilter={anyFilter}
							onOpen={(g) => navigate(partnerDetailPath(g.partnerId))}
						/>
					) : (
						<TransactionDebtTable
							rows={debtStore.transactionRows}
							anyFilter={anyFilter}
							onOpen={openTransaction}
						/>
					)}
				</>
			)}
		</Box>
	);
});

export default DebtPage;
