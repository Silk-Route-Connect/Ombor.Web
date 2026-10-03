import React, { useState } from "react";
import { Product } from "models/product";
import { designTokens, radius } from "theme";
import { getImageFullUrl } from "utils/productUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

/**
 * Row leading visual: the product's image, or the box-icon tile when it has
 * none or the image fails to load (a broken image never shows its alt text).
 * Neutral when archived.
 */
export const ProductThumb: React.FC<{ product: Product }> = ({ product }) => {
	const [failed, setFailed] = useState(false);
	const image = product.images?.[0];
	const src = image ? getImageFullUrl(image.thumbnailUrl ?? image.originalUrl) : null;
	const showImage = Boolean(src) && !failed;

	return (
		<Box
			sx={{
				width: 34,
				height: 34,
				flex: "0 0 auto",
				borderRadius: `${radius.md}px`,
				overflow: "hidden",
				display: "inline-grid",
				placeItems: "center",
				bgcolor: product.isArchived ? designTokens.gray100 : "primary.light",
				color: product.isArchived ? "text.secondary" : "primary.main",
			}}
		>
			{showImage ? (
				<Box
					component="img"
					src={src ?? undefined}
					alt=""
					onError={() => setFailed(true)}
					sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
				/>
			) : (
				<Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
			)}
		</Box>
	);
};

export default ProductThumb;
