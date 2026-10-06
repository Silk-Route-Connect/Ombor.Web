import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { employeeDetailPath } from "routing/paths";

interface EmployeeLinkProps {
	id: number;
	name: string;
	archived?: boolean;
}

/** Navigates to the employee's routed detail page. */
const EmployeeLink: React.FC<EmployeeLinkProps> = ({ id, name, archived }) => (
	<DetailLink to={employeeDetailPath(id)} archived={archived}>
		{name}
	</DetailLink>
);

export default EmployeeLink;
