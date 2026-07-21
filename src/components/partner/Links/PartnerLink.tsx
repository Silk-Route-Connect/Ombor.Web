import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { partnerDetailPath } from "routing/paths";

interface PartnerLinkProps {
	id: number;
	name: string;
}

/** Navigates to the partner's routed detail page. */
const PartnerLink: React.FC<PartnerLinkProps> = ({ id, name }) => (
	<DetailLink to={partnerDetailPath(id)}>{name}</DetailLink>
);

export default PartnerLink;
