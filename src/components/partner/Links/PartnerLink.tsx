import React from "react";
import { Link } from "@mui/material";

interface PartnerLinkProps {
	id: number;
	name: string;
}

const PartnerLink: React.FC<PartnerLinkProps> = ({ id, name }) => (
	<Link
		href={`/partners/${id}`}
		underline="none"
		sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
	>
		{name}
	</Link>
);

export default PartnerLink;
