import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductFormModal from "components/product/Form/ProductFormModal";
import ProductHeader from "components/product/Header/ProductHeader";
import ProductDialogs from "components/product/ProductDialogs";
import ProductsTable from "components/product/Table/ProductsTable";
import { readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { productDetailPath } from "routing/paths";
import { ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { ServerErrorHandler } from "utils/formServerErrors";
import { productStockLevel } from "utils/productFilters";
import { measurementLabel, toProductRequest } from "utils/productUtils";

import { Box } from "@mui/material";

const ProductPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { productStore, categoryStore } = useStore();

	useEffect(() => {
		categoryStore.getAll();
		productStore.getAll();
	}, [categoryStore, productStore]);

	const dialogMode = productStore.dialogMode;
	const editingProduct = dialogMode.kind === "form" ? (dialogMode.product ?? null) : null;

	const handleFormSave = (
		payload: ProductFormValues,
		imagesToRemove: number[],
		applyServerErrors: ServerErrorHandler,
	): void => {
		const request = toProductRequest(payload);

		if (editingProduct) {
			productStore.update(
				{ ...request, id: editingProduct.id, imagesToDelete: imagesToRemove },
				applyServerErrors,
			);
		} else {
			productStore.create(request, applyServerErrors);
		}
	};

	const handleExport = (): void => {
		const rows = readyOr(productStore.filteredProducts, []);

		const columns: CsvColumn<Product>[] = [
			{ header: t("product.table.sku"), value: (p) => p.sku },
			{ header: t("product.table.name"), value: (p) => p.name },
			{ header: t("product.table.type"), value: (p) => t(`product.type.${p.type}`) },
			{ header: t("product.table.category"), value: (p) => p.categoryName ?? "" },
			{ header: t("product.table.stock"), value: (p) => p.totalStock },
			{ header: t("product.table.measurement"), value: (p) => measurementLabel(t, p.measurement) },
			{
				header: t("product.table.stockLevel"),
				value: (p) => {
					const level = p.isArchived ? "ok" : productStockLevel(p);
					return level === "ok" ? "" : t(`product.stockLevel.${level}`);
				},
			},
			{
				header: t("product.table.salePrice"),
				value: (p) => (p.type === "Supply" ? "" : p.salePrice),
			},
			{
				header: t("product.table.supplyPrice"),
				value: (p) => (p.type === "Sale" ? "" : p.supplyPrice),
			},
			{
				header: t("product.table.status"),
				value: (p) =>
					p.isArchived ? t("product.table.archivedBadge") : t("product.status.active"),
			},
		];

		exportToCsv(`products_${csvDateStamp()}`, columns, rows);
	};

	const isFiltering =
		productStore.searchTerm.trim().length > 0 ||
		productStore.categoryFilter !== null ||
		productStore.typeFilter !== "all" ||
		productStore.stockFilter !== "all" ||
		productStore.showArchived;

	return (
		<Box>
			<ProductHeader
				searchValue={productStore.searchTerm}
				selectedCategory={productStore.categoryFilter}
				typeFilter={productStore.typeFilter}
				stockFilter={productStore.stockFilter}
				showArchived={productStore.showArchived}
				archivedCount={productStore.archivedCount}
				onSearch={productStore.setSearch}
				onCategoryChange={productStore.setCategoryFilter}
				onTypeChange={productStore.setTypeFilter}
				onStockChange={productStore.setStockFilter}
				onToggleArchived={productStore.setShowArchived}
				onCreate={productStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(productStore.filteredProducts, []).length}
			/>

			<ProductsTable
				onRetry={() => void productStore.getAll()}
				errorTitle={t("product.error.getAll")}
				data={productStore.filteredProducts}
				isFiltering={isFiltering}
				onCreate={productStore.openCreate}
				onOpen={(product) => navigate(productDetailPath(product.id))}
				onEdit={productStore.openEdit}
				onArchive={productStore.openArchive}
				onRestore={productStore.openRestore}
				onDelete={productStore.openDelete}
			/>

			<ProductFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={productStore.isSaving}
				product={editingProduct}
				onClose={productStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ProductDialogs />
		</Box>
	);
});

export default ProductPage;
