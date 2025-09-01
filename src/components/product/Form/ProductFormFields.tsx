import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useFilePreviews } from "hooks/product/useFilePreviews";
import { UseProductFormResult } from "hooks/product/useProductForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { getImageFullUrl } from "utils/productUtils";

import { Box, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";

import ProductFormCoreFields from "./Fields/ProductCoreFields";
import ProductFormPackaging from "./Fields/ProductFormPackaging";
import ProductFormImages from "./Images/ProductFormImages";

export interface ProductFormFieldsProps {
	api: UseProductFormResult;
	disabled: boolean;
	onGenerateSku?: () => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
	api,
	disabled,
	onGenerateSku,
	imagesBaseUrlResolver,
}) => {
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

	const handleAddAttachments = (files: FileList) => {
		addAttachments(files);
	};

	const handleAddMainAndMakeActive = (file: File) => {
		// Add single file and set it as main (UI)
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
		<Grid container spacing={3}>
			{/* Images */}
			<Grid size={{ xs: 12, md: 4 }}>
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
					onAddAttachments={handleAddAttachments}
					onAddMainAndMakeActive={handleAddMainAndMakeActive}
					resolveUrl={resolveUrl}
				/>
			</Grid>

			{/* Fields */}
			<Grid size={{ xs: 12, md: 8 }}>
				<Stack spacing={2.5}>
					<ProductFormCoreFields
						control={control}
						setValue={setValue}
						disabled={disabled}
						onGenerateSku={onGenerateSku}
					/>

					<Box>
						<ProductFormPackaging
							control={control}
							disabled={disabled}
							hasPackaging={hasPackaging}
							packPrice={packPrice}
							enablePackaging={enablePackaging}
							disablePackaging={disablePackaging}
						/>
					</Box>

					<Controller
						name="description"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.description")}
								fullWidth
								multiline
								minRows={3}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							/>
						)}
					/>
				</Stack>
			</Grid>
		</Grid>
	);
};

export default observer(ProductFormFields);
