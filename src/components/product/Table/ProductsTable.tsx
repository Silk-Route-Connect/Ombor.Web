import React from "react";
import { useTranslation } from "react-i18next";
import { buildProductColumns } from "components/product/Table/productsTableConfigs";
import { DataTable, SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Product } from "models/product";

import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Button, Paper, Typography } from "@mui/material";

// 10/25/50 steps, defaulting to 10 (product decision; the prototype footer
// shows 25).
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface ProductsTableProps {
	data: Loadable<Product[]>;
	isFiltering: boolean;
	onCreate: () => void;
	onOpen: (product: Product) => void;
	onEdit: (product: Product) => void;
	onArchive: (product: Product) => void;
	onRestore: (product: Product) => void;
	onSort: (field: keyof Product, order: SortOrder) => void;
}

const EmptyState: React.FC<{ isFiltering: boolean; onCreate: () => void }> = ({
	isFiltering,
	onCreate,
}) => {
	const { t } = useTranslation();

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
				<Inventory2OutlinedIcon sx={{ fontSize: 26 }} />
			</Box>

			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{isFiltering ? t("product.empty.searchTitle") : t("product.empty.title")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 380, mx: "auto", lineHeight: 1.6 }}
			>
				{isFiltering ? t("product.empty.searchBody") : t("product.empty.body")}
			</Typography>

			{!isFiltering && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("product.create")}
				</Button>
			)}
		</Paper>
	);
};

export const ProductsTable: React.FC<ProductsTableProps> = ({
	data,
	isFiltering,
	onCreate,
	onOpen,
	onEdit,
	onArchive,
	onRestore,
	onSort,
}) => {
	const { t } = useTranslation();
	const columns = buildProductColumns({ t, onEdit, onArchive, onRestore });

	if (data !== "loading" && data.length === 0) {
		return <EmptyState isFiltering={isFiltering} onCreate={onCreate} />;
	}

	return (
		<DataTable<Product>
			rows={data}
			columns={columns}
			pagination
			rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
			onRowClick={onOpen}
			onSort={onSort}
		/>
	);
};

export default ProductsTable;
