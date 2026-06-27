import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { productDetailPath } from "routing/paths";

interface ProductLinkProps {
	id: number;
	name: string;
}

/** Navigates to the product's routed detail page. */
const ProductLink: React.FC<ProductLinkProps> = ({ id, name }) => (
	<DetailLink to={productDetailPath(id)}>{name}</DetailLink>
);

export default ProductLink;
