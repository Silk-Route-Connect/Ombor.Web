import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { walletDetailPath } from "routing/paths";

interface WalletLinkProps {
	id: number;
	name: string;
}

/** Navigates to the wallet's routed detail page. */
const WalletLink: React.FC<WalletLinkProps> = ({ id, name }) => (
	<DetailLink to={walletDetailPath(id)}>{name}</DetailLink>
);

export default WalletLink;
