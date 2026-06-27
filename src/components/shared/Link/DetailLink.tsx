import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Link } from "@mui/material";

interface DetailLinkProps {
	/** Concrete detail route — resolve from routing/paths.ts, never a string literal. */
	to: string;
	children: React.ReactNode;
}

/**
 * Canonical detail-page link: theme-primary colour, underline-on-hover, SPA
 * navigation via react-router. This is the single place link styling lives — the
 * per-entity wrappers (PartnerLink, ProductLink, WarehouseLink, WalletLink, …)
 * supply only the route + display text. Colour is the theme token `primary.main`
 * and the hover underline comes from MUI's semantic `underline` prop — no inline
 * hex or text-decoration values.
 */
export const DetailLink: React.FC<DetailLinkProps> = ({ to, children }) => (
	<Link component={RouterLink} to={to} underline="hover" sx={{ color: "primary.main" }}>
		{children}
	</Link>
);

export default DetailLink;
