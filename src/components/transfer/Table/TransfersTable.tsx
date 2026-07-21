import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import { buildTransferColumns } from "components/transfer/Table/transfersTableConfigs";
import { Loadable } from "helpers/Loading";
import { Transfer } from "models/transfer";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";

interface TransfersTableProps {
	rows: Loadable<Transfer[]>;
	isFiltering: boolean;
	/** Whether any transfer exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onOpen: (transfer: Transfer) => void;
	onCreate: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const EmptyState: React.FC<{ isFiltering: boolean; hasAny: boolean; onCreate: () => void }> = ({
	isFiltering,
	hasAny,
	onCreate,
}) => {
	const { t } = useTranslation();
	const empty = !hasAny && !isFiltering;

	return (
		<Paper
			elevation={1}
			sx={{ borderRadius: 2, border: 1, borderColor: "divider", px: 3, py: 7, textAlign: "center" }}
		>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: 2,
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
				<SwapHorizOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{empty ? t("transfer.empty.title") : t("transfer.empty.searchTitle")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.6 }}
			>
				{empty ? t("transfer.empty.body") : t("transfer.empty.searchBody")}
			</Typography>
			{empty && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("transfer.create")}
				</Button>
			)}
		</Paper>
	);
};

export const TransfersTable: React.FC<TransfersTableProps> = ({
	rows,
	isFiltering,
	hasAny,
	onOpen,
	onCreate,
}) => {
	const { t } = useTranslation();

	if (rows !== "loading" && rows.length === 0) {
		return <EmptyState isFiltering={isFiltering} hasAny={hasAny} onCreate={onCreate} />;
	}

	return (
		<DataTable<Transfer>
			rows={rows}
			columns={buildTransferColumns(t)}
			pagination
			rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
			onRowClick={onOpen}
		/>
	);
};

export default TransfersTable;
