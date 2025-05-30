// src/pages/ProductPage.tsx
import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import ProductFormModal, { ProductFormPayload } from "components/product/Form/ProductFormModal";
import { CategoryOption, ProductHeader } from "components/product/Header/ProductHeader";
import { productColumns } from "components/product/productTableConfig";
import ProductSidePane from "components/product/SidePane/ProductSidePane";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { useStore } from "stores/StoreContext";

const ProductPage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState<boolean>(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const { productStore, categoryStore } = useStore();

	useEffect(() => {
		categoryStore.loadCategories();
		productStore.loadProducts();
	}, [categoryStore, productStore]);

	useEffect(() => {
		productStore.loadProducts();
	}, [productStore.searchTerm, productStore.categoryFilter]);

	const rows = useMemo<Loadable<Product[]>>(() => {
		return productStore.filteredProducts;
	}, [productStore.filteredProducts]);

	const handleEdit = useCallback((p: Product) => {
		setSelectedProduct(p);
		setIsFormOpen(true);
	}, []);

	const handleClose = () => {
		setSelectedProduct(null);
		setIsFormOpen(false);
	};

	const handleDelete = useCallback(
		(product: Product) => {
			setSelectedProduct(product);
			setIsDeleteDialogOpen(true);
		},
		[productStore],
	);

	const handleArchive = useCallback(
		(product: Product) => {
			if (product) {
				console.log("Archive product:", product);
			}
		},
		[productStore],
	);

	const handleSave = useCallback(
		(payload: ProductFormPayload) => {
			if (selectedProduct) {
				productStore.updateProduct({ ...payload, id: selectedProduct.id });
			} else {
				productStore.createProduct({ ...payload });
			}

			setIsFormOpen(false);
			setSelectedProduct(null);
		},
		[productStore],
	);

	const handleRowClick = useCallback(
		(product: Product) => {
			if (product) {
				setSelectedProduct(product);
				setIsSidePaneOpen(true);
			}
		},
		[productStore],
	);

	const handleSidePaneClose = (): void => {
		setSelectedProduct(null);
		setIsSidePaneOpen(false);
	};

	const onDeleteConfirmed = (): void => {
		if (selectedProduct) {
			productStore.deleteProduct(selectedProduct.id);
		}

		setIsDeleteDialogOpen(false);
		setSelectedProduct(null);
	};

	const columns = useMemo<Column<Product>[]>(
		() => [
			...productColumns,
			{
				key: "actions",
				headerName: "",
				width: 80,
				align: "right",
				renderCell: (p: Product) => (
					<ActionMenuCell
						onEdit={() => handleEdit(p)}
						onArchive={() => handleArchive(p)}
						onDelete={() => handleDelete(p)}
					/>
				),
			},
		],
		[handleEdit, handleDelete],
	);

	const categoryOptions = useMemo(() => {
		if (categoryStore.allCategories === "loading") {
			return [];
		}

		return categoryStore.allCategories as CategoryOption[];
	}, [categoryStore.allCategories]);

	const getConfirmationContent = (): JSX.Element => {
		if (!selectedProduct) {
			return <Typography>Вы уверены, что хотите удалить этот товар?</Typography>;
		}

		return (
			<Typography>
				Вы уверены, что хотите удалить товар <strong>{selectedProduct.name}</strong>?
			</Typography>
		);
	};

	return (
		<>
			<ProductHeader
				searchValue={productStore.searchTerm}
				onSearch={(v) => productStore.setSearch(v)}
				categoryOptions={categoryOptions}
				selectedCategory={productStore.categoryFilter}
				onCategoryChange={(id) => productStore.setCategory(id)}
				onCreate={() => setIsFormOpen(true)}
			/>

			<DataTable<Product>
				rows={rows}
				columns={columns}
				pagination
				onRowClick={(product) => handleRowClick(product)}
			/>

			<ProductFormModal
				categories={categoryOptions}
				isOpen={isFormOpen}
				product={selectedProduct}
				onClose={() => handleClose()}
				onSave={(payload) => handleSave(payload)}
			/>
			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title="Подтвердите удаление"
				content={getConfirmationContent()}
				confirmLabel="Удалить"
				cancelLabel="Отмена"
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={onDeleteConfirmed}
			/>
			<ProductSidePane
				product={selectedProduct}
				open={isSidePaneOpen}
				onClose={() => handleSidePaneClose()}
			/>
		</>
	);
});

export default ProductPage;
