import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { productDetailPath } from "routing/paths";

interface ProductLinkProps {
	id: number;
	name: string;
	archived?: boolean;
}

/** Navigates to the product's routed detail page. */
const ProductLink: React.FC<ProductLinkProps> = ({ id, name, archived }) => (
	<DetailLink to={productDetailPath(id)} archived={archived}>
		{name}
	</DetailLink>
);

export default ProductLink;
