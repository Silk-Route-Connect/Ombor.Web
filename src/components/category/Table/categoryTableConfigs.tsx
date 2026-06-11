import { CategoryActionMenu } from "components/category/Table/ActionMenu/CategoryActionMenu";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Category } from "models/category";
import { numericSx } from "theme";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, Typography } from "@mui/material";

interface BuildColumnsOptions {
	t: TFunction;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
}

/**
 * Columns are built at render time so labels resolve through the live `t`
 * (docs/conventions.md — no `t()` at module scope). Sorting is client-side via
 * the shared DataTable.
 */
export function buildCategoryColumns({
	t,
	onEdit,
	onDelete,
}: BuildColumnsOptions): Column<Category>[] {
	return [
		{
			key: "name",
			field: "name",
			headerName: t("category.table.name"),
			width: "32%",
			sortable: true,
			renderCell: (category) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box
						sx={{
							width: 32,
							height: 32,
							flex: "0 0 auto",
							borderRadius: 1,
							bgcolor: "primary.light",
							color: "primary.main",
							display: "grid",
							placeItems: "center",
						}}
					>
						<LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />
					</Box>
					<Typography component="span" sx={{ fontWeight: 600 }}>
						{category.name}
					</Typography>
				</Box>
			),
		},
		{
			key: "description",
			field: "description",
			headerName: t("category.table.description"),
			width: "48%",
			sortable: true,
			renderCell: (category) =>
				category.description ? (
					<Typography
						component="span"
						sx={{ color: "text.secondary", display: "block", maxWidth: 460 }}
					>
						{category.description}
					</Typography>
				) : (
					<Typography component="span" sx={{ color: "text.disabled" }}>
						—
					</Typography>
				),
		},
		{
			key: "productCount",
			headerName: t("category.table.productCount"),
			width: "12%",
			align: "right",
			renderCell: (category) =>
				category.productCount > 0 ? (
					<Typography component="span" sx={{ ...numericSx, fontWeight: 700 }}>
						{category.productCount}
					</Typography>
				) : (
					<Typography component="span" sx={{ ...numericSx, color: "text.disabled" }}>
						0
					</Typography>
				),
		},
		{
			key: "actions",
			headerName: "",
			width: 56,
			align: "right",
			renderCell: (category) => (
				<CategoryActionMenu onEdit={() => onEdit(category)} onDelete={() => onDelete(category)} />
			),
		},
	];
}
