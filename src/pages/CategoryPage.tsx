import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CategoryDeleteBlockedDialog from "components/category/Form/CategoryDeleteBlockedDialog";
import CategoryFormModal from "components/category/Form/CategoryFormModal";
import CategoryHeader from "components/category/Header/CategoryHeader";
import { CategoryTable } from "components/category/Table/CategoryTable";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { CategoryFormPayload } from "hooks/category/useCategoryForm";
import { observer } from "mobx-react-lite";

import { Alert, Box, Stack, Typography } from "@mui/material";

import { useStore } from "../stores/StoreContext";

const CategoryPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { categoryStore } = useStore();

	useEffect(() => {
		categoryStore.getAll();
	}, [categoryStore]);

	const handleFormSave = (payload: CategoryFormPayload) => {
		const request = { name: payload.name, description: payload.description ?? undefined };

		return categoryStore.selectedCategory
			? categoryStore.update({ id: categoryStore.selectedCategory.id, ...request })
			: categoryStore.create(request);
	};

	const handleDeleteConfirmed = (): void => {
		if (categoryStore.selectedCategory) {
			categoryStore.delete(categoryStore.selectedCategory.id);
		}
	};

	const dialogType = categoryStore.dialogMode.type;
	const selected = categoryStore.selectedCategory;

	return (
		<Box>
			<CategoryHeader
				searchValue={categoryStore.searchTerm}
				onSearch={categoryStore.setSearch}
				onCreate={categoryStore.openCreate}
			/>

			<CategoryTable
				data={categoryStore.filteredCategories}
				searchTerm={categoryStore.searchTerm}
				onCreate={categoryStore.openCreate}
				onEdit={categoryStore.openEdit}
				onDelete={categoryStore.openDelete}
				onSort={categoryStore.setSort}
			/>

			<CategoryFormModal
				isOpen={dialogType === "form"}
				isSaving={categoryStore.isSaving}
				category={selected}
				onClose={categoryStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogType === "delete"}
				title={t("category.delete.title", { name: selected?.name ?? "" })}
				content={
					<Stack spacing={1.5}>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							{t("category.delete.body")}
						</Typography>
						{categoryStore.deleteError && (
							<Alert severity="error" variant="outlined">
								{categoryStore.deleteError}
							</Alert>
						)}
					</Stack>
				}
				confirmLabel={t("common.delete")}
				cancelLabel={t("common.cancel")}
				onCancel={categoryStore.closeDialog}
				onConfirm={handleDeleteConfirmed}
			/>

			<CategoryDeleteBlockedDialog
				isOpen={dialogType === "deleteBlocked"}
				category={selected}
				onClose={categoryStore.closeDialog}
			/>
		</Box>
	);
});

export default CategoryPage;
