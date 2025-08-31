import React from "react";
import { Link } from "@mui/material";

interface PaymentLinkProps {
	id: number;
}

const ProductLink: React.FC<PaymentLinkProps> = ({ id }) => (
	<Link
		href={`/payments/${id}`}
		underline="none"
		sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
	>
		#{id}
	</Link>
);

export default ProductLink;
