import React, { useEffect } from "react";
import CategoryFormModal from "components/category/Form/CategoryFormModal";
import CategoryHeader from "components/category/Header/CategoryHeader";
import { CategoryTable } from "components/category/Table/CategoryTable";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { CategoryFormPayload } from "hooks/category/useCategoryForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";

import { Box } from "@mui/material";

import { useStore } from "../stores/StoreContext";

const CategoryPage: React.FC = observer(() => {
	const { categoryStore } = useStore();

	useEffect(() => {
		categoryStore.getAll();
	}, [categoryStore]);

	const handleFormSave = (payload: CategoryFormPayload) =>
		categoryStore.selectedCategory
			? categoryStore.update({ id: categoryStore.selectedCategory.id, ...payload })
			: categoryStore.create(payload);

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
				title={translate("category.title")}
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
				title={translate("common.deleteTitle")}
				content={translate("category.deleteConfirmation", {
					categoryName: categoryStore.selectedCategory?.name || "",
				})}
				onCancel={categoryStore.closeDialog}
				onConfirm={handleDeleteConfirmed}
			/>
		</Box>
	);
});

export default CategoryPage;
