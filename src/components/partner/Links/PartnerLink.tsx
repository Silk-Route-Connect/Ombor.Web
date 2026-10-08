import React from "react";
import DetailLink, { DetailLinkVariant } from "components/shared/Link/DetailLink";
import { partnerDetailPath } from "routing/paths";

interface PartnerLinkProps {
	id: number;
	name: string;
	archived?: boolean;
	/** `secondary` when the entity supports the row rather than leads it. */
	variant?: DetailLinkVariant;
}

/** Navigates to the partner's routed detail page. */
const PartnerLink: React.FC<PartnerLinkProps> = ({ id, name, archived, variant }) => (
	<DetailLink to={partnerDetailPath(id)} archived={archived} variant={variant}>
		{name}
	</DetailLink>
);

export default PartnerLink;
