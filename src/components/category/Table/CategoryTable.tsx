import React from "react";
import { useTranslation } from "react-i18next";
import { buildCategoryColumns } from "components/category/Table/categoryTableConfigs";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Category } from "models/category";

import AddIcon from "@mui/icons-material/Add";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";

interface CategoryTableProps {
	data: Loadable<Category[]>;
	total: number;
	page: number;
	pageSize: number;
	searchTerm: string;
	onCreate: () => void;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
}

const CARD_SX = {
	borderRadius: 2,
	border: 1,
	borderColor: "divider",
} as const;

const EmptyState: React.FC<{ searchTerm: string; onCreate: () => void }> = ({
	searchTerm,
	onCreate,
}) => {
	const { t } = useTranslation();
	const isSearch = searchTerm.trim().length > 0;

	return (
		<Paper elevation={1} sx={{ ...CARD_SX, px: 3, py: 7, textAlign: "center" }}>
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
				<LocalOfferOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>

			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{isSearch ? t("category.empty.searchTitle") : t("category.empty.title")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
			>
				{isSearch
					? t("category.empty.searchBody", { query: searchTerm })
					: t("category.empty.body")}
			</Typography>

			{!isSearch && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("category.create")}
				</Button>
			)}
		</Paper>
	);
};

export const CategoryTable: React.FC<CategoryTableProps> = ({
	data,
	total,
	page,
	pageSize,
	searchTerm,
	onCreate,
	onEdit,
	onDelete,
	onPageChange,
	onPageSizeChange,
}) => {
	const { t } = useTranslation();
	const columns = buildCategoryColumns({ t, onEdit, onDelete });

	if (data !== "loading" && data.length === 0) {
		return <EmptyState searchTerm={searchTerm} onCreate={onCreate} />;
	}

	return (
		<DataTable<Category>
			rows={data}
			columns={columns}
			pagination
			serverPagination={{
				total,
				page,
				rowsPerPage: pageSize,
				onPageChange,
				onRowsPerPageChange: onPageSizeChange,
			}}
		/>
	);
};
