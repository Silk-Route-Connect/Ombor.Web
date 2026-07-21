import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";

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

/** 40px image tile with a hover «remove» badge. */
const ImageThumb: React.FC<{
	src: string;
	alt: string;
	disabled: boolean;
	onRemove: () => void;
	removeTitle: string;
}> = ({ src, alt, disabled, onRemove, removeTitle }) => (
	<Box sx={{ position: "relative", width: 40, height: 40, flex: "0 0 auto" }}>
		<Box
			component="img"
			src={src}
			alt={alt}
			sx={{
				width: "100%",
				height: "100%",
				objectFit: "cover",
				display: "block",
				borderRadius: "6px",
				border: "1px solid",
				borderColor: "divider",
			}}
		/>
		{!disabled && (
			<ButtonBase
				onClick={onRemove}
				title={removeTitle}
				sx={{
					position: "absolute",
					top: -5,
					right: -5,
					width: 16,
					height: 16,
					borderRadius: "50%",
					bgcolor: "error.main",
					color: "#fff",
				}}
			>
				<CloseIcon sx={{ fontSize: 11 }} />
			</ButtonBase>
		)}
	</Box>
);

/**
 * Image block per the bundle's `.prod-upload` / `.prod-thumbs`: a dashed upload
 * square (150px, surface-sub, primary tint on hover) with a row of 40px
 * mini-tiles below for the uploaded images. The single square is the only
 * additive upload control — no placeholder «+» slots (DEC-13).
 */
const ProductFormImages: React.FC<ProductFormImagesProps> = ({
	disabled,
	existingImages,
	attachments,
	attachmentPreviews,
	onRemoveExisting,
	onRemoveAttachment,
	onAddAttachments,
	resolveUrl,
}) => {
	const { t } = useTranslation();
	const uploadInputRef = useRef<HTMLInputElement | null>(null);

	const openUpload = () => uploadInputRef.current?.click();

	const imageCount = existingImages.length + attachments.length;

	return (
		<Box>
			<input
				ref={uploadInputRef}
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

			{/* .prod-upload */}
			<ButtonBase
				onClick={openUpload}
				disabled={disabled}
				sx={{
					width: "100%",
					height: 150,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
					p: "20px 12px",
					border: "1.5px dashed",
					borderColor: designTokens.gray300,
					borderRadius: "8px",
					bgcolor: designTokens.gray25,
					color: "text.secondary",
					textAlign: "center",
					transition: "border-color .14s, color .14s, background .14s",
					"&:hover": {
						borderColor: "primary.main",
						color: "primary.main",
						bgcolor: designTokens.primarySoft,
					},
				}}
			>
				<Box
					sx={{
						width: 38,
						height: 38,
						borderRadius: "10px",
						bgcolor: designTokens.gray100,
						color: designTokens.gray600,
						display: "grid",
						placeItems: "center",
					}}
				>
					<UploadFileOutlinedIcon sx={{ fontSize: 20 }} />
				</Box>
				<Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, color: "inherit" }}>
					{t("product.images.uploadMore")}
				</Typography>
			</ButtonBase>

			{/* .prod-thumbs — uploaded images only; no placeholder «+» slots (DEC-13) */}
			{imageCount > 0 && (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
					{existingImages.map((img) => (
						<ImageThumb
							key={`existing-${img.id}`}
							src={resolveUrl(img.thumbnailUrl ?? img.originalUrl)}
							alt={img.name}
							disabled={disabled}
							onRemove={() => onRemoveExisting(img.id)}
							removeTitle={t("product.images.remove")}
						/>
					))}
					{attachments.map((file, index) => (
						<ImageThumb
							key={`new-${file.name}-${index}`}
							src={attachmentPreviews[index]}
							alt={file.name}
							disabled={disabled}
							onRemove={() => onRemoveAttachment(index)}
							removeTitle={t("product.images.remove")}
						/>
					))}
				</Box>
			)}
		</Box>
	);
};

export default ProductFormImages;
