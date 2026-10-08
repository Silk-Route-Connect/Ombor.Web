import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import { readyOr } from "helpers/Loading";
import { useProductForm } from "hooks/product/useProductForm";
import { useSkuAutofill } from "hooks/product/useSkuAutofill";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { ProductFormInputs, ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";
import { ServerErrorHandler } from "utils/formServerErrors";

import ProductFormFields from "./ProductFormFields";

/**
 * The body keeps one height while «Фасовка» opens and the type swaps the price
 * row, so the dialog never jumps; it fits the closed form and scrolls once the
 * packaging card opens (and shrinks to a short viewport).
 */
const BODY_HEIGHT = 850;

export interface ProductFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	/** Create only: values to start from (the POS passes the typed name or barcode). */
	defaults?: Partial<ProductFormInputs>;
	onSave: (
		payload: ProductFormValues,
		imagesToRemove: number[],
		applyServerErrors: ServerErrorHandler,
	) => void;
	onClose: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	isSaving,
	product,
	defaults,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { categoryStore } = useStore();

	const form = useProductForm({ isOpen, isSaving, product, defaults, onSave });
	const onKeyDown = useFormKeyboardSubmit(form.submit, isSaving);
	const sku = useSkuAutofill(form.form, isOpen, !product);

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		form.formState.isDirty,
		isSaving,
		onClose,
	);

	useEffect(() => {
		if (isOpen) {
			categoryStore.getAll();
		}
	}, [isOpen, categoryStore]);

	const categories = readyOr(categoryStore.allCategories, []);
	const firstCategoryId =
		categories.length > 0
			? [...categories].sort((a, b) => a.name.localeCompare(b.name, "ru"))[0].id
			: null;

	// Pre-select the first category (A–Z) on create — there is no default-category
	// concept (canon rule 42), so the alphabetically-first is the sensible default.
	// Create flow only; not marked dirty so closing an untouched form doesn't prompt.
	useEffect(() => {
		if (
			isOpen &&
			!product &&
			firstCategoryId != null &&
			form.form.getValues("categoryId") == null
		) {
			form.form.setValue("categoryId", firstCategoryId, { shouldDirty: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, product, firstCategoryId]);

	return (
		<FormDialog
			open={isOpen}
			size="lg"
			title={t(product ? "product.title.edit" : "product.title.create")}
			subtitle={product?.sku}
			tile={recordTile("Product")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			bodyHeight={BODY_HEIGHT}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					onCancel={requestClose}
					onSave={form.submit}
					canSave={form.canSave}
					loading={isSaving}
					submitLabel={product ? undefined : t("product.form.submitCreate")}
				/>
			}
		>
			<ProductFormFields
				api={form}
				onGenerateSku={sku.regenerate}
				skuAutofill={!product}
				disabled={isSaving}
			/>
		</FormDialog>
	);
};

export default observer(ProductFormModal);
