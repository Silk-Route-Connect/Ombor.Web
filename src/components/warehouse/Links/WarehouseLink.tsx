import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { warehouseDetailPath } from "routing/paths";

interface WarehouseLinkProps {
	id: number;
	name: string;
	archived?: boolean;
}

/** Navigates to the warehouse's routed detail page. */
const WarehouseLink: React.FC<WarehouseLinkProps> = ({ id, name, archived }) => (
	<DetailLink to={warehouseDetailPath(id)} archived={archived}>
		{name}
	</DetailLink>
);

export default WarehouseLink;
