import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useProductForm } from "hooks/product/useProductForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Dialog, DialogContent, LinearProgress } from "@mui/material";

import ProductFormFields from "./ProductFormFields";

const CONTENT_HEIGHT = 620;

export interface ProductFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	onSave: (payload: ProductFormValues, imagesToRemove: number[]) => void;
	onClose: () => void;
}

const generateSku = (): string => `SKU-${Math.floor(10000 + Math.random() * 89999)}`;

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	isSaving,
	product,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { categoryStore } = useStore();

	const form = useProductForm({ isOpen, isSaving, product, onSave });
	const onKeyDown = useFormKeyboardSubmit(form.submit, isSaving);

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

	const categories = categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories;
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

	const handleGenerateSku = () =>
		form.form.setValue("sku", generateSku(), { shouldDirty: true, shouldValidate: true });

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				onKeyDown={onKeyDown}
				slotProps={{
					// Bundle .fcard/.prod-dialog: 720px wide, r-lg corners.
					paper: { sx: { width: 720, maxWidth: "94%", borderRadius: "12px" } },
				}}
			>
				<FormDialogHeader
					title={t(product ? "product.title.edit" : "product.title.create")}
					subtitle={product?.sku}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ maxHeight: CONTENT_HEIGHT, overflowY: "auto", pt: 2 }}>
					<ProductFormFields api={form} onGenerateSku={handleGenerateSku} disabled={isSaving} />
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={form.submit}
					canSave={form.canSave}
					loading={isSaving}
				/>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("common.dialog.discardChanges.title")}
				content={t("common.dialog.discardChanges.body")}
				confirmLabel={t("common.dialog.discardChanges.confirm")}
				cancelLabel={t("common.dialog.discardChanges.cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default observer(ProductFormModal);
