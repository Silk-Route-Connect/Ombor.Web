import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { walletDetailPath } from "routing/paths";

interface WalletLinkProps {
	id: number;
	name: string;
	archived?: boolean;
}

/** Navigates to the wallet's routed detail page. */
const WalletLink: React.FC<WalletLinkProps> = ({ id, name, archived }) => (
	<DetailLink to={walletDetailPath(id)} archived={archived}>
		{name}
	</DetailLink>
);

export default WalletLink;
