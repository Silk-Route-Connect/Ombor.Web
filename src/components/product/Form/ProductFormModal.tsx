import React, { useEffect } from "react";
import { Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";
import ProductFormFields from "components/product/Form/ProductFormFields";
import ConfirmDialog from "components/shared/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useProductForm } from "hooks/product/useProductForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";

import ProductFormFieldsV2 from "./ProductFormFieldsV2";

const CONTENT_HEIGHT = 600;

export interface ProductFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	formVersion: "v1" | "v2";
	onSave: (payload: ProductFormValues) => void;
	onClose: () => void;
	onGenerateSku?: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	isSaving,
	product,
	formVersion = "v1",
	onSave,
	onClose,
	onGenerateSku,
}) => {
	const { categoryStore } = useStore();

	const form = useProductForm({
		isOpen,
		isSaving,
		product,
		onSave,
	});

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

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				fullWidth
				maxWidth="md"
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
			>
				<FormDialogHeader
					title={translate(product ? "product.title.edit" : "product.title.create")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent
					dividers
					sx={{
						maxHeight: CONTENT_HEIGHT,
						overflowY: "auto",
						pt: 2,
					}}
				>
					{formVersion === "v1" ? (
						<ProductFormFields api={form} onGenerateSku={onGenerateSku} disabled={isSaving} />
					) : (
						<ProductFormFieldsV2 api={form} onGenerateSku={onGenerateSku} disabled={isSaving} />
					)}
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
				title={translate("unsavedChangesTitle")}
				content={<Typography>{translate("unsavedChangesContent")}</Typography>}
				confirmLabel={translate("common.dialog.discardChanges.confirm")}
				cancelLabel={translate("common.dialog.discardChanges.cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default observer(ProductFormModal);
