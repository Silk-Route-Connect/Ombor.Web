import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildCategoryColumns } from "components/category/Table/categoryTableConfigs";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { Loadable } from "helpers/Loading";
import { Category } from "models/category";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

interface CategoryTableProps {
	data: Loadable<Category[]>;
	searchTerm: string;
	onCreate: () => void;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить категории». */
	errorTitle: string;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
	onRetry,
	errorTitle,
	data,
	searchTerm,
	onCreate,
	onEdit,
	onDelete,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildCategoryColumns(t, { onEdit, onDelete }),
		[t, onEdit, onDelete],
	);
	const isSearch = searchTerm.trim().length > 0;

	return (
		<DataTable<Category>
			rows={data}
			onRetry={onRetry}
			errorTitle={errorTitle}
			columns={columns}
			defaultSort={{ key: "name", order: "asc" }}
			empty={
				<TableEmptyState
					icon={<LocalOfferOutlinedIcon />}
					title={isSearch ? t("category.empty.searchTitle") : t("category.empty.title")}
					hint={
						isSearch
							? t("category.empty.searchBody", { query: searchTerm })
							: t("category.empty.body")
					}
					action={isSearch ? undefined : { label: t("category.create"), onClick: onCreate }}
				/>
			}
		/>
	);
};
