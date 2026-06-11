import React from "react";
import { useTranslation } from "react-i18next";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box, Stack, Tooltip, Typography } from "@mui/material";

export interface ProductFormMainImageProps {
	disabled?: boolean;
	src?: string | null;
	onClick?: () => void;
}

const ProductFormMainImage: React.FC<ProductFormMainImageProps> = ({ disabled, src, onClick }) => {
	const { t } = useTranslation();

	return (
		<Tooltip title={t("product.images.mainUpload")}>
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
				aria-label={t("product.images.mainUpload")}
			>
				{src ? (
					<Box
						component="img"
						src={src}
						alt={t("product.images.mainAlt")}
						sx={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<Stack alignItems="center" spacing={0.5}>
						<AddCircleOutlineIcon fontSize="large" />
						<Typography variant="caption">{t("product.images.setMain")}</Typography>
					</Stack>
				)}
			</Box>
		</Tooltip>
	);
};

export default ProductFormMainImage;
