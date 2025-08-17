import React from "react";
import { FormControlLabel, Switch, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { UseProductFormResult } from "hooks/product/useProductForm";
import { translate } from "i18n/i18n";
import { getImageFullUrl } from "utils/productUtils";

import { ProductAttachmentsField } from "./Sections/ProductAttachmentsField";
import { ProductCodesFields } from "./Sections/ProductCodesFields";
import { ProductDescriptionField } from "./Sections/ProductDescriptionField";
import ProductIdentityFields from "./Sections/ProductIdentityFields";
import { ProductImagesGallery } from "./Sections/ProductImagesGallery";
import { ProductPackagingFields } from "./Sections/ProductPackagingFields";
import { ProductTypePricesFields } from "./Sections/ProductPricesFields";

export interface ProductFormFieldsProps {
	api: UseProductFormResult;
	disabled: boolean;
	onGenerateSku?: () => void;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({ api, disabled, onGenerateSku }) => {
	const {
		form,
		hasPackaging,
		packPrice,
		enablePackaging,
		disablePackaging,
		existingImages,
		markImageForRemoval,
		attachments,
		addAttachments,
		removeAttachment,
	} = api;

	const handlePackagingToggle = (checked: boolean) => {
		if (checked) enablePackaging();
		else disablePackaging();
	};

	return (
		<Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 3 }}>
			<ProductIdentityFields form={form} disabled={disabled} />
			<ProductCodesFields form={form} disabled={disabled} onGenerateSku={onGenerateSku} />
			<ProductTypePricesFields form={form} disabled={disabled} />

			<Grid size={{ xs: 12 }}>
				<FormControlLabel
					control={
						<Switch
							checked={hasPackaging}
							disabled={disabled}
							onChange={(_, checked) => handlePackagingToggle(checked)}
						/>
					}
					label={translate("product.packaging")}
				/>
			</Grid>

			{hasPackaging && (
				<ProductPackagingFields form={form} disabled={disabled} packPrice={packPrice} />
			)}

			<ProductDescriptionField form={form} disabled={disabled} />

			{existingImages.length > 0 && (
				<Grid size={{ xs: 12 }}>
					<ProductImagesGallery
						images={existingImages}
						disabled={disabled}
						imagesBaseUrlResolver={(url) => getImageFullUrl(url) ?? ""}
						onRemoveExistingImage={markImageForRemoval}
					/>
				</Grid>
			)}

			<Grid size={{ xs: 12 }}>
				<ProductAttachmentsField
					attachments={attachments}
					addAttachments={addAttachments}
					removeAttachment={removeAttachment}
					disabled={disabled}
					errorMessage={form.formState.errors.attachments?.message}
				/>
				{form.formState.errors.attachments && (
					<Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
						{form.formState.errors.attachments.message as string}
					</Typography>
				)}
			</Grid>
		</Grid>
	);
};

export default ProductFormFields;
