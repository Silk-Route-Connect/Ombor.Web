import React from "react";
import DetailLink, { DetailLinkVariant } from "components/shared/Link/DetailLink";
import { warehouseDetailPath } from "routing/paths";

interface WarehouseLinkProps {
	id: number;
	name: string;
	archived?: boolean;
	/** `secondary` when the entity supports the row rather than leads it. */
	variant?: DetailLinkVariant;
}

/** Navigates to the warehouse's routed detail page. */
const WarehouseLink: React.FC<WarehouseLinkProps> = ({ id, name, archived, variant }) => (
	<DetailLink to={warehouseDetailPath(id)} archived={archived} variant={variant}>
		{name}
	</DetailLink>
);

export default WarehouseLink;
