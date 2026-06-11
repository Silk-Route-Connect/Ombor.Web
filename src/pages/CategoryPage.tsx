import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CategoryFormModal from "components/category/Form/CategoryFormModal";
import CategoryHeader from "components/category/Header/CategoryHeader";
import { CategoryTable } from "components/category/Table/CategoryTable";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { CategoryFormPayload } from "hooks/category/useCategoryForm";
import { observer } from "mobx-react-lite";

import { Box } from "@mui/material";

import { useStore } from "../stores/StoreContext";

const CategoryPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { categoryStore } = useStore();

	useEffect(() => {
		categoryStore.getAll();
	}, [categoryStore]);

	const handleFormSave = (payload: CategoryFormPayload) => {
		const request = { ...payload, description: payload.description ?? undefined };

		return categoryStore.selectedCategory
			? categoryStore.update({ id: categoryStore.selectedCategory.id, ...request })
			: categoryStore.create(request);
	};

	const handleDeleteConfirmed = (): void => {
		if (categoryStore.selectedCategory) {
			categoryStore.delete(categoryStore.selectedCategory.id);
		}
	};

	const { dialogMode } = categoryStore;
	const dialogType = dialogMode.type;

	return (
		<Box>
			<CategoryHeader
				title={t("category.title")}
				searchValue={categoryStore.searchTerm}
				onSearch={categoryStore.setSearch}
				onCreate={categoryStore.openCreate}
			/>

			<CategoryTable
				data={categoryStore.filteredCategories}
				pagination
				onDelete={categoryStore.openDelete}
				onEdit={categoryStore.openEdit}
				onSort={categoryStore.setSort}
			/>

			<CategoryFormModal
				isOpen={dialogType === "form"}
				isSaving={categoryStore.isSaving}
				category={categoryStore.selectedCategory}
				onClose={categoryStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogType === "delete"}
				title={t("common.deleteTitle")}
				content={t("category.deleteConfirmation", {
					categoryName: categoryStore.selectedCategory?.name || "",
				})}
				onCancel={categoryStore.closeDialog}
				onConfirm={handleDeleteConfirmed}
			/>
		</Box>
	);
});

export default CategoryPage;
