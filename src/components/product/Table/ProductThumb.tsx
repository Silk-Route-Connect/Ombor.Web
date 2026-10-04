import React from "react";
import ProductImage from "components/product/ProductImage";
import { Product } from "models/product";
import { radius } from "theme";
import { getImageFullUrl } from "utils/productUtils";

/** Row leading visual: the product's first image or the placeholder; neutral when archived. */
export const ProductThumb: React.FC<{ product: Product }> = ({ product }) => {
	const image = product.images?.[0];
	return (
		<ProductImage
			src={image ? getImageFullUrl(image.thumbnailUrl ?? image.originalUrl) : undefined}
			alt=""
			size={34}
			radius={radius.md}
			muted={product.isArchived}
		/>
	);
};

export default ProductThumb;
