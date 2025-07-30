import React, { JSX, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CategoryHeader from "components/category/Header/CategoryHeader";
import CategoryFormModal, {
	CategoryFormPayload,
} from "components/category/modal/CategoryFormModal";
import { CategoryTable } from "components/category/Table/CategoryTable";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";

import { Category } from "../models/category";
import { useStore } from "../stores/StoreContext";

const CategoryPage: React.FC = observer(() => {
	const { categoryStore } = useStore();

	const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

	useEffect(() => {
		categoryStore.getAll();
	}, [categoryStore]);

	const onCreate = (): void => {
		setSelectedCategory(null);
		setIsFormOpen(true);
	};

	const onEdit = (category: Category) => {
		setSelectedCategory(category);
		setIsFormOpen(true);
	};

	const onFormSave = (payload: CategoryFormPayload): void => {
		if (selectedCategory) {
			categoryStore.update({
				id: selectedCategory.id,
				...payload,
			});
		} else {
			categoryStore.create({
				...payload,
			});
		}

		setIsFormOpen(false);
	};

	const onDelete = (category: Category) => {
		setIsDeleteDialogOpen(true);
		setSelectedCategory(category);
	};

	const onDeleteConfirmed = (): void => {
		setIsDeleteDialogOpen(false);

		if (selectedCategory) {
			categoryStore.delete(selectedCategory.id);
		}
	};

	const getConfirmationContent = (): JSX.Element => (
		<Typography>
			{translate("category.deleteConfirmation", {
				categoryName: selectedCategory?.name || "",
			})}
		</Typography>
	);

	return (
		<Box>
			<CategoryHeader
				title={translate("category.title")}
				searchValue={categoryStore.searchTerm}
				onSearch={(value) => categoryStore.setSearch(value)}
				onCreate={onCreate}
			/>

			<CategoryTable
				data={categoryStore.filteredCategories}
				pagination
				onDelete={onDelete}
				onEdit={onEdit}
				onSort={(field, order) => categoryStore.setSort(field, order)}
			/>

			<CategoryFormModal
				isOpen={isFormOpen}
				category={selectedCategory}
				onClose={() => setIsFormOpen(false)}
				onSave={onFormSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("common.deleteTitle")}
				content={getConfirmationContent()}
				confirmLabel={translate("common.delete")}
				cancelLabel={translate("common.cancel")}
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={onDeleteConfirmed}
			/>
		</Box>
	);
});

export default CategoryPage;
