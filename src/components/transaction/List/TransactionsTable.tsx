import React from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { isReady, Loadable } from "helpers/Loading";
import { TransactionRecord } from "models/transaction";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface TransactionsTableProps {
	rows: Loadable<TransactionRecord[]>;
	columns: Column<TransactionRecord>[];
	direction: TransactionDirection;
	isFiltering: boolean;
	onOpen: (tx: TransactionRecord) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить партнёров». */
	errorTitle: string;
}

const EmptyState: React.FC<{
	direction: TransactionDirection;
	filtering: boolean;
	onCreate: () => void;
}> = ({ direction, filtering, onCreate }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ p: "56px 24px 60px", textAlign: "center" }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: "14px",
					mx: "auto",
					mb: 2,
					display: "grid",
					placeItems: "center",
					bgcolor: "grey.50",
					border: 1,
					borderColor: "divider",
					color: "text.disabled",
				}}
			>
				<ReceiptLongOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{filtering ? t("transaction.empty.searchTitle") : t(`transaction.empty.title.${direction}`)}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.6 }}
			>
				{filtering
					? t(`transaction.empty.searchBody.${direction}`)
					: t(`transaction.empty.body.${direction}`)}
			</Typography>
			{!filtering && (
				<Box sx={{ mt: 2.25 }}>
					<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
						{t(`transaction.list.new.${direction}`)}
					</PrimaryButton>
				</Box>
			)}
		</Box>
	);
};

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	columns,
	direction,
	isFiltering,
	onOpen,
	onCreate,
}) => {
	if (!isReady(rows)) {
		return <LoadStateView state={rows} onRetry={onRetry} errorTitle={errorTitle} />;
	}

	if (rows.length === 0) {
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<EmptyState direction={direction} filtering={isFiltering} onCreate={onCreate} />
			</Paper>
		);
	}

	return (
		<DataTable<TransactionRecord>
			rows={rows}
			columns={columns}
			pagination
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
		/>
	);
};

export default TransactionsTable;
