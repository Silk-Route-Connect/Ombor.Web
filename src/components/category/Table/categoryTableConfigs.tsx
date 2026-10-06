import React from "react";
import { CategoryActionMenu } from "components/category/Table/ActionMenu/CategoryActionMenu";
import EntityCell from "components/shared/Table/cells/EntityCell";
import NotesCell from "components/shared/Table/cells/NotesCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TFunction } from "i18next";
import { Category } from "models/category";
import { radius } from "theme";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box } from "@mui/material";

export interface CategoryColumnHandlers {
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
}

const CategoryIcon: React.FC = () => (
	<Box
		sx={{
			width: 32,
			height: 32,
			flex: "0 0 auto",
			borderRadius: `${radius.md}px`,
			bgcolor: "primary.light",
			color: "primary.main",
			display: "grid",
			placeItems: "center",
		}}
	>
		<LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />
	</Box>
);

/**
 * Category list columns (conventions.md → Tables): Категория · Описание ·
 * Товаров · ⋮. Categories have no detail page, so the name is plain 600 text.
 */
export function buildCategoryColumns(
	t: TFunction,
	{ onEdit, onDelete }: CategoryColumnHandlers,
): Column<Category>[] {
	return [
		{
			key: "name",
			headerName: t("category.table.name"),
			sortValue: (c) => c.name,
			renderCell: (c) => (
				<EntityCell avatar={<CategoryIcon />}>
					<Box component="span" sx={{ fontWeight: 600 }}>
						{c.name}
					</Box>
				</EntityCell>
			),
		},
		{
			key: "description",
			headerName: t("category.table.description"),
			sortable: false,
			renderCell: (c) => <NotesCell text={c.description} maxWidth={460} />,
		},
		{
			key: "productCount",
			headerName: t("category.table.productCount"),
			align: "right",
			sortValue: (c) => c.productCount,
			renderCell: (c) => <QuantityCell value={c.productCount} />,
		},
		{
			key: "actions",
			headerName: "",
			width: ACTIONS_COLUMN_WIDTH,
			align: "right",
			renderCell: (c) => (
				<CategoryActionMenu onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />
			),
		},
	];
}
