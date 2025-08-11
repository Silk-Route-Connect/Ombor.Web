import React, { useEffect, useMemo } from "react";
import ProductFormModal from "components/product/Form/ProductFormModal";
import { ProductHeader } from "components/product/Header/ProductHeader";
import ProductSidePane from "components/product/SidePane/ProductSidePane";
import ProductsTable from "components/product/Table/ProductsTable";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { ProductFormPayload } from "hooks/product/useProductForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

const ProductPage: React.FC = observer(() => {
	const { productStore, categoryStore } = useStore();

	useEffect(() => {
		categoryStore.getAll();
		productStore.getAll();
	}, [categoryStore, productStore]);

	useEffect(() => {
		productStore.getAll();
	}, [productStore.searchTerm, productStore.categoryFilter]);

	const handleFormSave = (payload: ProductFormPayload): void => {
		if (productStore.selectedProduct) {
			productStore.update({
				...payload,
				id: productStore.selectedProduct.id,
				imagesToDelete: [],
			});
		} else {
			productStore.create({ ...payload });
		}
	};

	const handleDelete = () => {
		if (productStore.selectedProduct) {
			productStore.delete(productStore.selectedProduct.id);
		}

		productStore.closeDialog();
	};

	const headerTitle = useMemo(
		() =>
			productStore.filteredProducts === "loading"
				? translate("product.title")
				: `${translate("product.title")} (${productStore.filteredProducts.length})`,
		[productStore.filteredProducts],
	);

	const dialogMode = productStore.dialogMode;
	const dialogKind = dialogMode.kind;

	return (
		<>
			<ProductHeader
				title={headerTitle}
				searchValue={productStore.searchTerm}
				selectedCategory={productStore.categoryFilter}
				onSearch={productStore.setSearch}
				onCategoryChange={productStore.setCategoryFilter}
				onCreate={productStore.openCreate}
			/>

			<ProductsTable
				data={productStore.filteredProducts}
				pagination
				onViewDetails={productStore.openDetails}
				onEdit={productStore.openEdit}
				onDelete={productStore.openDelete}
				onArchive={() => {}}
				onSort={productStore.setSort}
			/>

			<ProductFormModal
				isOpen={dialogKind === "form"}
				isSaving={productStore.isSaving}
				product={productStore.selectedProduct}
				onClose={productStore.closeDialog}
				onGenerateSku={() => {}}
				onSave={(payload) => handleFormSave(payload)}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "delete"}
				title={translate("common.deleteTitle")}
				content={translate("product.deleteConfirmation", {
					productName: productStore.selectedProduct?.name ?? "",
				})}
				onCancel={productStore.closeDialog}
				onConfirm={handleDelete}
			/>

			<ProductSidePane
				open={dialogKind === "details"}
				product={productStore.selectedProduct}
				onClose={productStore.closeDialog}
			/>
		</>
	);
});

export default ProductPage;
