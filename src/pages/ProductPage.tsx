import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductFormModal from "components/product/Form/ProductFormModal";
import ProductHeader from "components/product/Header/ProductHeader";
import ProductsTable from "components/product/Table/ProductsTable";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { CreateProductRequest, Product } from "models/product";
import { productDetailPath } from "routing/paths";
import { ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { mapFormPackagingToPackaging, measurementLabel } from "utils/productUtils";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
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

	const handleFormSave = (payload: ProductFormValues): void => {
		const request: CreateProductRequest = {
			categoryId: payload.categoryId,
			name: payload.name,
			sku: payload.sku,
			description: payload.description,
			barcode: payload.barcode,
			salePrice: payload.salePrice,
			supplyPrice: payload.supplyPrice,
			measurement: payload.measurement,
			type: payload.type,
			lowStockThreshold: payload.lowStockThreshold ?? null,
			packaging: mapFormPackagingToPackaging(payload.packaging),
			attachments: payload.attachments,
		};

		if (editingProduct) {
			productStore.update({ ...request, id: editingProduct.id, imagesToDelete: [] });
		} else {
			productStore.create(request);
		}
	};

	const handleExport = (): void => {
		const rows = productStore.filteredProducts === "loading" ? [] : productStore.filteredProducts;

		const columns: CsvColumn<Product>[] = [
			{ header: t("product.table.name"), value: (p) => p.name },
			{ header: t("product.table.sku"), value: (p) => p.sku },
			{ header: t("product.table.category"), value: (p) => p.categoryName ?? "" },
			{ header: t("product.table.measurement"), value: (p) => measurementLabel(t, p.measurement) },
			{ header: t("product.table.type"), value: (p) => t(`product.type.${p.type}`) },
			{ header: t("product.table.stock"), value: (p) => p.totalStock },
			{ header: t("product.table.salePrice"), value: (p) => p.salePrice || "" },
			{ header: t("product.table.supplyPrice"), value: (p) => p.supplyPrice || "" },
			{
				header: t("product.table.status"),
				value: (p) =>
					p.isArchived ? t("product.table.archivedBadge") : t("product.status.active"),
			},
		];

		exportToCsv(`products_${csvDateStamp()}`, columns, rows);
	};

	// Title shows the total dataset size (archived included); the table footer
	// already reflects the filtered view.
	const totalCount =
		productStore.allProducts === "loading" ? null : productStore.allProducts.length;

	const isFiltering =
		productStore.searchTerm.trim().length > 0 ||
		productStore.categoryFilter !== null ||
		productStore.typeFilter !== "all" ||
		productStore.showArchived;

	return (
		<Box>
			<ProductHeader
				totalCount={totalCount}
				searchValue={productStore.searchTerm}
				selectedCategory={productStore.categoryFilter}
				typeFilter={productStore.typeFilter}
				showArchived={productStore.showArchived}
				archivedCount={productStore.archivedCount}
				onSearch={productStore.setSearch}
				onCategoryChange={productStore.setCategoryFilter}
				onTypeChange={productStore.setTypeFilter}
				onToggleArchived={productStore.setShowArchived}
				onCreate={productStore.openCreate}
				onExport={handleExport}
			/>

			<ProductsTable
				data={productStore.filteredProducts}
				isFiltering={isFiltering}
				onCreate={productStore.openCreate}
				onOpen={(product) => navigate(productDetailPath(product.id))}
				onEdit={productStore.openEdit}
				onArchive={productStore.openArchive}
				onRestore={productStore.openRestore}
				onSort={productStore.setSort}
			/>

			<ProductFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={productStore.isSaving}
				product={editingProduct}
				onClose={productStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "archive"}
				icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("product.archive.title", {
					name: dialogMode.kind === "archive" ? dialogMode.product.name : "",
				})}
				content={t("product.archive.body")}
				confirmLabel={t("common.archive")}
				cancelLabel={t("common.cancel")}
				confirmVariant="warning"
				onCancel={productStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "archive") {
						productStore.archive(dialogMode.product);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "restore"}
				icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("product.restore.title", {
					name: dialogMode.kind === "restore" ? dialogMode.product.name : "",
				})}
				content={t("product.restore.body")}
				confirmLabel={t("common.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={productStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "restore") {
						productStore.restore(dialogMode.product);
					}
				}}
			/>
		</Box>
	);
});

export default ProductPage;
