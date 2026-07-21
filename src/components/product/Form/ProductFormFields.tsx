import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { useFilePreviews } from "hooks/product/useFilePreviews";
import { UseProductFormResult } from "hooks/product/useProductForm";
import { observer } from "mobx-react-lite";
import { getImageFullUrl } from "utils/productUtils";

import { Box, Divider, Stack, TextField } from "@mui/material";

import ProductFormCoreFields from "./Fields/ProductCoreFields";
import ProductFormPackaging from "./Fields/ProductFormPackaging";
import ProductFormImages from "./Images/ProductFormImages";

export interface ProductFormFieldsProps {
	api: UseProductFormResult;
	disabled: boolean;
	onGenerateSku?: () => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

/**
 * Dialog body per the bundle: core fields (with the image block in the top
 * grid's left column), a section divider (20px margins), «Фасовка», and the
 * description textarea (20px above).
 */
const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
	api,
	disabled,
	onGenerateSku,
	imagesBaseUrlResolver,
}) => {
	const { t } = useTranslation();
	const {
		form,
		hasPackaging,
		packPrice,
		enablePackaging,
		disablePackaging,
		existingImages,
		attachments,
		addAttachments,
		removeAttachment,
		markImageForRemoval,
		mainSelection,
		selectMainExisting,
		selectMainNew,
	} = api;

	const { control, setValue } = form;

	const previews = useFilePreviews(attachments);

	const resolveUrl = useMemo(
		() => (src: string) =>
			imagesBaseUrlResolver ? imagesBaseUrlResolver(src) : (getImageFullUrl(src) ?? src),
		[imagesBaseUrlResolver],
	);

	const handleAddMainImage = (file: File) => {
		const insertionIndex = attachments.length;
		const listLike: FileList = {
			0: file,
			length: 1,
			item: (i: number) => (i === 0 ? file : null),
		} as unknown as FileList;
		addAttachments(listLike);
		selectMainNew(insertionIndex);
	};

	return (
		<Box>
			<ProductFormCoreFields
				control={control}
				setValue={setValue}
				disabled={disabled}
				onGenerateSku={onGenerateSku}
				imagesSlot={
					<ProductFormImages
						disabled={disabled}
						existingImages={existingImages}
						attachments={attachments}
						attachmentPreviews={previews}
						mainSelection={mainSelection}
						onSetMainExisting={selectMainExisting}
						onSetMainNew={selectMainNew}
						onRemoveExisting={markImageForRemoval}
						onRemoveAttachment={removeAttachment}
						onAddAttachments={addAttachments}
						onAddMainAndMakeActive={handleAddMainImage}
						resolveUrl={resolveUrl}
					/>
				}
			/>

			<Divider sx={{ my: "20px" }} />

			<ProductFormPackaging
				control={control}
				disabled={disabled}
				hasPackaging={hasPackaging}
				packPrice={packPrice}
				enablePackaging={enablePackaging}
				disablePackaging={disablePackaging}
			/>

			<Stack sx={{ gap: "7px", mt: "20px" }}>
				<FormFieldLabel label={t("product.description")} />
				<Controller
					name="description"
					control={control}
					render={({ field, fieldState }) => (
						<TextField
							{...field}
							value={field.value ?? ""}
							size="small"
							fullWidth
							multiline
							minRows={3}
							placeholder={t("product.form.descriptionPlaceholder")}
							error={!!fieldState.error}
							helperText={fieldState.error?.message}
							disabled={disabled}
						/>
					)}
				/>
			</Stack>
		</Box>
	);
};

export default observer(ProductFormFields);
