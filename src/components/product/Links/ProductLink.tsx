import React from "react";
import DetailLink, { DetailLinkVariant } from "components/shared/Link/DetailLink";
import { productDetailPath } from "routing/paths";

interface ProductLinkProps {
	id: number;
	name: string;
	archived?: boolean;
	/** `secondary` when the entity supports the row rather than leads it. */
	variant?: DetailLinkVariant;
}

/** Navigates to the product's routed detail page. */
const ProductLink: React.FC<ProductLinkProps> = ({ id, name, archived, variant }) => (
	<DetailLink to={productDetailPath(id)} archived={archived} variant={variant}>
		{name}
	</DetailLink>
);

export default ProductLink;
