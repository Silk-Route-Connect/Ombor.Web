import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { productDetailPath } from "routing/paths";

import { Link } from "@mui/material";

interface ProductLinkProps {
	id: number;
	name: string;
}

/** Navigates to the product's routed detail page. */
const ProductLink: React.FC<ProductLinkProps> = ({ id, name }) => (
	<Link
		component={RouterLink}
		to={productDetailPath(id)}
		underline="none"
		sx={{ color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
	>
		{name}
	</Link>
);

export default ProductLink;
