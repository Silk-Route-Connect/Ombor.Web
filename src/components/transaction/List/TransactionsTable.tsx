import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { TransactionRecord } from "models/transaction";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

interface TransactionsTableProps {
	rows: Loadable<TransactionRecord[]>;
	columns: Column<TransactionRecord>[];
	direction: TransactionDirection;
	isFiltering: boolean;
	onOpen: (tx: TransactionRecord) => void;
	onCreate: () => void;
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
	rows,
	columns,
	direction,
	isFiltering,
	onOpen,
	onCreate,
}) => {
	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
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
			rowsPerPageOptions={[25, 50, 100]}
			onRowClick={onOpen}
		/>
	);
};

export default TransactionsTable;
