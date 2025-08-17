import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { translate } from "i18n/i18n";
import { ProductImage } from "models/product";

export interface ProductImagesGalleryProps {
	images: ProductImage[];
	disabled: boolean;
	onRemoveExistingImage?: (imageId: number) => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

export const ProductImagesGallery: React.FC<ProductImagesGalleryProps> = ({
	images,
	disabled,
	onRemoveExistingImage,
	imagesBaseUrlResolver,
}) => {
	const resolveSrc = (src: string) => (imagesBaseUrlResolver ? imagesBaseUrlResolver(src) : src);

	return (
		<Grid size={{ xs: 12 }}>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
				{images.map((img) => (
					<Box key={img.id} sx={{ position: "relative" }}>
						<Box
							component="img"
							src={resolveSrc(img.thumbnailUrl ?? img.originalUrl)}
							alt={img.name}
							sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
						/>
						{onRemoveExistingImage && (
							<IconButton
								size="small"
								onClick={() => onRemoveExistingImage(img.id)}
								sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper" }}
								aria-label={translate("action.removeImage")}
								disabled={disabled}
							>
								<CloseIcon fontSize="small" color="error" />
							</IconButton>
						)}
					</Box>
				))}
			</Box>
		</Grid>
	);
};
