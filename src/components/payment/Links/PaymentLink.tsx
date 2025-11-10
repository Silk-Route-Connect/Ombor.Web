import React from "react";

import { Link } from "@mui/material";

interface PaymentLinkProps {
	id: number;
}

const PaymentLink: React.FC<PaymentLinkProps> = ({ id }) => (
	<Link
		href={`/payments/${id}`}
		underline="none"
		sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
	>
		#{id}
	</Link>
);

export default PaymentLink;
