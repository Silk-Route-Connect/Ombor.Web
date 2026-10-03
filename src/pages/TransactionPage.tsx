import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TransactionListHeader from "components/transaction/List/TransactionListHeader";
import TransactionsTable from "components/transaction/List/TransactionsTable";
import {
	buildTransactionColumns,
	transactionDetailPath,
	transactionDisplayNumber,
	transactionTypeLabel,
} from "components/transaction/List/transactionTableConfigs";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { TransactionRecord } from "models/transaction";
import { OPEN_REFUND_STATE } from "routing/navigationState";
import { PATHS, saleDetailPath, supplyDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatEntityId } from "utils/formatEntityId";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import { Box } from "@mui/material";

interface TransactionPageProps {
	mode: TransactionDirection;
}

const TransactionPage: React.FC<TransactionPageProps> = observer(({ mode }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { transactionStore } = useStore();

	useEffect(() => {
		transactionStore.resetFilters();
		void transactionStore.getAll();
	}, [transactionStore, mode]);

	const fullyRefundedIds = transactionStore.fullyRefundedIds;
	const columns = useMemo(
		() =>
			buildTransactionColumns(t, {
				isFullyRefunded: (tx) => fullyRefundedIds.has(tx.id),
				onRefund: (tx) => navigate(transactionDetailPath(tx), { state: OPEN_REFUND_STATE }),
			}),
		[t, fullyRefundedIds, navigate],
	);

	const rows = mode === "Sale" ? transactionStore.salesFeed : transactionStore.suppliesFeed;
	const detailPath = mode === "Sale" ? saleDetailPath : supplyDetailPath;
	const newPath = mode === "Sale" ? PATHS.newSale : PATHS.newSupply;

	const isFiltering =
		transactionStore.searchTerm.trim() !== "" ||
		transactionStore.statusFilter !== "all" ||
		transactionStore.dateRange !== "all";

	const handleExport = () => {
		if (!isReady(rows)) {
			return;
		}
		exportToCsv<TransactionRecord>(
			`${mode === "Sale" ? "sales" : "supplies"}_${csvDateStamp()}`,
			[
				{
					header: t("transaction.col.number"),
					value: (tx) => formatEntityId(transactionDisplayNumber(tx)),
				},
				{ header: t("transaction.col.date"), value: (tx) => formatDate(tx.date) },
				{ header: t("transaction.col.partner"), value: (tx) => tx.partnerName },
				{ header: t("transaction.col.type"), value: (tx) => transactionTypeLabel(t, tx) },
				{
					header: t("transaction.col.status"),
					value: (tx) => (isRefundType(tx.type) ? "" : t(`transaction.statusShort.${tx.status}`)),
				},
				{ header: t("transaction.col.positions"), value: (tx) => tx.lines.length },
				{ header: t("transaction.col.amount"), value: (tx) => tx.totalDue },
			],
			rows,
		);
	};

	return (
		<Box>
			<TransactionListHeader
				direction={mode}
				searchValue={transactionStore.searchTerm}
				statusFilter={transactionStore.statusFilter}
				dateRange={transactionStore.dateRange}
				onSearch={(v) => transactionStore.setSearchTerm(v)}
				onStatusChange={(s) => transactionStore.setStatusFilter(s)}
				onDateRangeChange={(r) => transactionStore.setDateRange(r)}
				onCreate={() => navigate(newPath)}
				onExport={handleExport}
				exportCount={readyOr(rows, []).length}
			/>

			<TransactionsTable
				onRetry={() => void transactionStore.getAll()}
				errorTitle={t("transactions.errors.getAll")}
				rows={rows}
				columns={columns}
				direction={mode}
				isFiltering={isFiltering}
				onOpen={(tx) => navigate(detailPath(tx.id))}
				onCreate={() => navigate(newPath)}
			/>
		</Box>
	);
});

export default TransactionPage;
