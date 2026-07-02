import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Order } from "models/order";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

interface OrdersTableProps {
	rows: Loadable<Order[]>;
	columns: Column<Order>[];
	isFiltering: boolean;
	onOpen: (order: Order) => void;
	onCreate: () => void;
}

const EmptyState: React.FC<{ filtering: boolean; onCreate: () => void }> = ({
	filtering,
	onCreate,
}) => {
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
				<SwapHorizOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{filtering ? t("order.empty.searchTitle") : t("order.empty.title")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", lineHeight: 1.6 }}
			>
				{filtering ? t("order.empty.searchBody") : t("order.empty.body")}
			</Typography>
			{!filtering && (
				<Box sx={{ mt: 2.25 }}>
					<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
						{t("order.create")}
					</PrimaryButton>
				</Box>
			)}
		</Box>
	);
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
	rows,
	columns,
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
				<EmptyState filtering={isFiltering} onCreate={onCreate} />
			</Paper>
		);
	}

	return (
		<DataTable<Order>
			rows={rows}
			columns={columns}
			pagination
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
		/>
	);
};

export default OrdersTable;
