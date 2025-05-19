// src/pages/ProductPage.tsx
import React, { useCallback, useEffect, useMemo } from "react";
import { ProductHeader } from "components/product/Header/ProductHeader";
import { productColumns } from "components/product/productTableConfig";
import { ActionCell } from "components/shared/ActionCell/ActionCell";
import { DataTable } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { ProductDto } from "models/product";
import { useStore } from "stores/StoreContext";

const ProductPage: React.FC = observer(() => {
	const { productStore, categoryStore } = useStore();

	// Initial load
	useEffect(() => {
		categoryStore.loadCategories();
		productStore.loadProducts();
	}, [categoryStore, productStore]);

	// Reload on filter changes
	useEffect(() => {
		productStore.loadProducts();
	}, [productStore.searchTerm, productStore.categoryFilter]);

	// Prepare rows for table
	const rows = useMemo<Loadable<ProductDto[]>>(() => {
		return productStore.filteredProducts;
	}, [productStore.filteredProducts]);

	// Handlers
	const handleEdit = useCallback((p: ProductDto) => {
		console.log("Editing product ID:", p.id);
		// TODO: open edit modal or side pane
	}, []);

	const handleDelete = useCallback(
		(id: number) => {
			productStore.deleteProduct(id);
		},
		[productStore],
	);

	const columns = useMemo(
		() => [
			...productColumns,
			{
				key: "actions",
				headerName: "",
				width: 100,
				renderCell: (p: ProductDto) => (
					<ActionCell onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p.id)} />
				),
			},
		],
		[handleEdit, handleDelete],
	);

	return (
		<>
			<ProductHeader
				searchValue={productStore.searchTerm}
				onSearch={(v) => productStore.setSearch(v)}
				categoryOptions={
					categoryStore.allCategories === "loading"
						? []
						: (categoryStore.allCategories as { id: number; name: string }[])
				}
				selectedCategory={productStore.categoryFilter}
				onCategoryChange={(id) => productStore.setCategory(id)}
				onCreate={() => {
					/* TODO: open create product modal */
				}}
			/>

			<DataTable<ProductDto> rows={rows} columns={columns} pagination onRowClick={handleEdit} />
		</>
	);
});

export default ProductPage;
