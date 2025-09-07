import React, { useMemo, useRef } from "react";
import { translate } from "i18n/i18n";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Box, Button, Stack } from "@mui/material";

import ProductFormImageTile from "./ProductFormImageTile";
import ProductFormMainImageCircle from "./ProductFormMainImage";

export interface ProductFormImagesProps {
	disabled: boolean;
	existingImages: Array<{ id: number; name: string; thumbnailUrl?: string; originalUrl: string }>;
	attachments: File[];
	attachmentPreviews: string[];
	mainSelection: { kind: "existing"; imageId: number } | { kind: "new"; index: number } | null;
	onSetMainExisting: (id: number) => void;
	onSetMainNew: (index: number) => void;
	onRemoveExisting: (id: number) => void;
	onRemoveAttachment: (index: number) => void;
	onAddAttachments: (files: FileList) => void;
	onAddMainAndMakeActive: (file: File) => void;
	resolveUrl: (src: string) => string;
}

const ProductFormImages: React.FC<ProductFormImagesProps> = ({
	disabled,
	existingImages,
	attachments,
	attachmentPreviews,
	mainSelection,
	onSetMainExisting,
	onSetMainNew,
	onRemoveExisting,
	onRemoveAttachment,
	onAddAttachments,
	onAddMainAndMakeActive,
	resolveUrl,
}) => {
	const mainUploadInputRef = useRef<HTMLInputElement | null>(null);
	const multiUploadInputRef = useRef<HTMLInputElement | null>(null);

	const openMainUpload = () => mainUploadInputRef.current?.click();
	const openMultiUpload = () => multiUploadInputRef.current?.click();

	const mainSrc = useMemo(() => {
		if (!mainSelection) return null;
		if (mainSelection.kind === "existing") {
			const img = existingImages.find((i) => i.id === mainSelection.imageId);
			if (!img) return null;
			return resolveUrl(img.thumbnailUrl ?? img.originalUrl);
		}
		return attachmentPreviews[mainSelection.index] ?? null;
	}, [attachmentPreviews, existingImages, mainSelection, resolveUrl]);

	const isMainExisting = (id: number) =>
		mainSelection?.kind === "existing" && mainSelection.imageId === id;
	const isMainNew = (idx: number) => mainSelection?.kind === "new" && mainSelection.index === idx;

	return (
		<Stack spacing={2}>
			{/* Main circle */}
			<Stack alignItems="center" spacing={1}>
				<input
					ref={mainUploadInputRef}
					type="file"
					accept="image/*"
					hidden
					disabled={disabled}
					onChange={(e) => {
						const files = e.currentTarget.files;
						if (files && files.length > 0) {
							onAddMainAndMakeActive(files[0]);
						}
						e.currentTarget.value = "";
					}}
				/>
				<ProductFormMainImageCircle disabled={disabled} src={mainSrc} onClick={openMainUpload} />
			</Stack>

			{/* Upload more — centered */}
			<Stack direction="row" justifyContent="center" alignItems="center">
				<input
					ref={multiUploadInputRef}
					type="file"
					accept="image/*"
					multiple
					hidden
					disabled={disabled}
					onChange={(e) => {
						const files = e.currentTarget.files;
						if (files && files.length > 0) {
							onAddAttachments(files);
						}
						e.currentTarget.value = "";
					}}
				/>
				<Button
					variant="outlined"
					size="small"
					startIcon={<AddPhotoAlternateIcon />}
					onClick={openMultiUpload}
					disabled={disabled}
				>
					{translate("product.images.uploadMore")}
				</Button>
			</Stack>

			{/* Existing images */}
			{existingImages.length > 0 && (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
					{existingImages.map((img) => {
						const src = resolveUrl(img.thumbnailUrl ?? img.originalUrl);
						return (
							<ProductFormImageTile
								key={img.id}
								src={src}
								alt={img.name}
								selected={isMainExisting(img.id)}
								disabled={disabled}
								onMakeMain={() => onSetMainExisting(img.id)}
								onRemove={() => onRemoveExisting(img.id)}
							/>
						);
					})}
				</Box>
			)}

			{/* New uploads */}
			{attachments.length > 0 && (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
					{attachments.map((file, index) => (
						<ProductFormImageTile
							key={`${file.name}-${index}`}
							src={attachmentPreviews[index]}
							alt={file.name}
							selected={isMainNew(index)}
							disabled={disabled}
							onMakeMain={() => onSetMainNew(index)}
							onRemove={() => onRemoveAttachment(index)}
						/>
					))}
				</Box>
			)}
		</Stack>
	);
};

export default ProductFormImages;
