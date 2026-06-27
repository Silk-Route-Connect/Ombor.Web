import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { warehouseDetailPath } from "routing/paths";

interface WarehouseLinkProps {
	id: number;
	name: string;
}

/** Navigates to the warehouse's routed detail page. */
const WarehouseLink: React.FC<WarehouseLinkProps> = ({ id, name }) => (
	<DetailLink to={warehouseDetailPath(id)}>{name}</DetailLink>
);

export default WarehouseLink;
