import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { employeeDetailPath } from "routing/paths";

interface EmployeeLinkProps {
	id: number;
	name: string;
}

/** Navigates to the employee's routed detail page. */
const EmployeeLink: React.FC<EmployeeLinkProps> = ({ id, name }) => (
	<DetailLink to={employeeDetailPath(id)}>{name}</DetailLink>
);

export default EmployeeLink;
