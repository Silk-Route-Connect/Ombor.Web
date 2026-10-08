import React from "react";
import DetailLink, { DetailLinkVariant } from "components/shared/Link/DetailLink";
import { walletDetailPath } from "routing/paths";

interface WalletLinkProps {
	id: number;
	name: string;
	archived?: boolean;
	/** `secondary` when the entity supports the row rather than leads it. */
	variant?: DetailLinkVariant;
}

/** Navigates to the wallet's routed detail page. */
const WalletLink: React.FC<WalletLinkProps> = ({ id, name, archived, variant }) => (
	<DetailLink to={walletDetailPath(id)} archived={archived} variant={variant}>
		{name}
	</DetailLink>
);

export default WalletLink;
