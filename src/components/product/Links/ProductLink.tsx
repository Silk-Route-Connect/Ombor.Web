import React from "react";

import { Link } from "@mui/material";

interface ProductLinkProps {
	id: number;
	name: string;
}

const ProductLink: React.FC<ProductLinkProps> = ({ id, name }) => (
	<Link
		href={`/products/${id}`}
		underline="none"
		sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
	>
		{name}
	</Link>
);

export default ProductLink;
