import React, { JSX, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CategoryHeader from "components/category/Header/CategoryHeader";
import CategoryFormModal, {
	CategoryFormPayload,
} from "components/category/modal/CategoryFormModal";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { observer } from "mobx-react-lite";

import { ActionCell } from "../components/shared/ActionCell/ActionCell";
import { Column, DataTable, SortOrder } from "../components/shared/DataTable/DataTable";
import { Category } from "../models/category";
import { useStore } from "../stores/StoreContext";

type FormState = "open" | "close";

const CategoryPage: React.FC = observer(() => {
	const [formState, setFormState] = React.useState<FormState>("close");
	const [dialogState, setDialogState] = React.useState<FormState>("close");
	const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
	const { categoryStore } = useStore();

	useEffect(() => {
		categoryStore.loadCategories();
	}, []);

	const columns: Column<Category>[] = [
		{ key: "name", field: "name", headerName: "Название", width: "30%", sortable: true },
		{
			key: "description",
			field: "description",
			headerName: "Описание",
			width: "60%",
			sortable: true,
		},
		{
			key: "actions",
			headerName: "",
			width: "10%",
			renderCell: (category: Category) => (
				<ActionCell onEdit={() => onEdit(category)} onDelete={() => onDelete(category)} />
			),
		},
	];

	const onCreate = (): void => {
		setSelectedCategory(null);
		setFormState("open");
	};

	const onEdit = (category: Category) => {
		setSelectedCategory(category);
		setFormState("open");
	};

	const onFormSave = (payload: CategoryFormPayload): void => {
		if (selectedCategory) {
			categoryStore.updateCategory({
				id: selectedCategory.id,
				name: payload.name,
				description: payload.description,
			});
		} else {
			categoryStore.createCategory({
				name: payload.name,
				description: payload.description,
			});
		}

		setFormState("close");
	};

	const onDelete = (category: Category) => {
		setDialogState("open");
		setSelectedCategory(category);
	};

	const onDeleteConfirmed = (): void => {
		setDialogState("close");

		if (selectedCategory) {
			categoryStore.deleteCategory(selectedCategory.id);
		}
	};

	const getConfirmationContent = (): JSX.Element => {
		if (!selectedCategory) {
			return <Typography>Вы уверены, что хотите удалить эту категорию?</Typography>;
		}

		return (
			<Typography>
				Вы уверены, что хотите удалить категорию <strong>{selectedCategory.name}</strong>?
			</Typography>
		);
	};

	return (
		<Box>
			<CategoryHeader
				title={"Категории"}
				searchValue={categoryStore.searchQuery}
				onSearch={(value) => categoryStore.search(value)}
				onCreate={onCreate}
			/>
			<DataTable
				rows={categoryStore.filteredCategories}
				columns={columns}
				pagination
				onSort={(field: keyof Category, order: SortOrder) => categoryStore.sort(field, order)}
			/>

			<CategoryFormModal
				isOpen={formState === "open"}
				category={selectedCategory}
				onClose={() => setFormState("close")}
				onSave={onFormSave}
			/>
			<ConfirmDialog
				isOpen={dialogState === "open"}
				title="Подтвердите удаление"
				content={getConfirmationContent()}
				confirmLabel="Удалить"
				cancelLabel="Отмена"
				onCancel={() => setDialogState("close")}
				onConfirm={onDeleteConfirmed}
			/>
		</Box>
	);
});

export default CategoryPage;
