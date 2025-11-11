import React from "react";

import { Link } from "@mui/material";

interface EmployeeLinkProps {
	id: number;
	name: string;
}

const EmployeeLink: React.FC<EmployeeLinkProps> = ({ id, name }) => (
	<Link
		href={`/employees/${id}`}
		underline="none"
		sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
	>
		{name}
	</Link>
);

export default EmployeeLink;
