import React from "react";
import DetailLink, { DetailLinkVariant } from "components/shared/Link/DetailLink";
import { employeeDetailPath } from "routing/paths";

interface EmployeeLinkProps {
	id: number;
	name: string;
	archived?: boolean;
	/** `secondary` when the entity supports the row rather than leads it. */
	variant?: DetailLinkVariant;
}

/** Navigates to the employee's routed detail page. */
const EmployeeLink: React.FC<EmployeeLinkProps> = ({ id, name, archived, variant }) => (
	<DetailLink to={employeeDetailPath(id)} archived={archived} variant={variant}>
		{name}
	</DetailLink>
);

export default EmployeeLink;
