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

const CONTENT_HEIGHT = 600;

export interface ProductFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	onSave: (payload: ProductFormValues) => void;
	onClose: () => void;
	onGenerateSku?: () => void;
	onRemoveExistingImage?: (imageId: number) => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	isSaving,
	product,
	onSave,
	onClose,
	onGenerateSku,
	onRemoveExistingImage,
	imagesBaseUrlResolver,
}) => {
	const { categoryStore } = useStore();

	const {
		form,
		formState,
		canSave,
		hasPackaging,
		packPrice,
		enablePackaging,
		disablePackaging,
		submit,
	} = useProductForm({
		isOpen,
		isSaving,
		product,
		onSave,
	});

	// Guard closing when dirty
	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// Prefetch dependencies when opening
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
					<ProductFormFields
						form={form}
						hasPackaging={hasPackaging}
						enablePackaging={enablePackaging}
						disablePackaging={disablePackaging}
						packPrice={packPrice}
						onGenerateSku={onGenerateSku}
						existingImages={product?.images ?? []}
						disabled={isSaving}
						onRemoveExistingImage={onRemoveExistingImage}
						imagesBaseUrlResolver={imagesBaseUrlResolver}
					/>
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
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
