import React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { translate } from "i18n/i18n";

export interface ProductFormMainImageProps {
	disabled?: boolean;
	src?: string | null;
	onClick?: () => void;
}

const ProductFormMainImage: React.FC<ProductFormMainImageProps> = ({ disabled, src, onClick }) => {
	return (
		<Tooltip title={translate("product.images.mainUpload")}>
			<Box
				onClick={!disabled ? onClick : undefined}
				sx={{
					width: 140,
					height: 140,
					borderRadius: "50%",
					border: (theme) => `2px dashed ${theme.palette.divider}`,
					display: "grid",
					placeItems: "center",
					cursor: disabled ? "default" : "pointer",
					overflow: "hidden",
					position: "relative",
					bgcolor: "background.default",
				}}
				aria-label={translate("product.images.mainUpload")}
			>
				{src ? (
					<Box
						component="img"
						src={src}
						alt={translate("product.images.mainAlt")}
						sx={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<Stack alignItems="center" spacing={0.5}>
						<AddCircleOutlineIcon fontSize="large" />
						<Typography variant="caption">{translate("product.images.setMain")}</Typography>
					</Stack>
				)}
			</Box>
		</Tooltip>
	);
};

export default ProductFormMainImage;
