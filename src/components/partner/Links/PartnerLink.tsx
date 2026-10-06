import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { partnerDetailPath } from "routing/paths";

interface PartnerLinkProps {
	id: number;
	name: string;
	archived?: boolean;
}

/** Navigates to the partner's routed detail page. */
const PartnerLink: React.FC<PartnerLinkProps> = ({ id, name, archived }) => (
	<DetailLink to={partnerDetailPath(id)} archived={archived}>
		{name}
	</DetailLink>
);

export default PartnerLink;
