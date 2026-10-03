import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Link, SxProps, Theme } from "@mui/material";

/**
 * The one entity-link look: primary, weight 600, the surrounding text size, an
 * underline on hover. An archived entity reads in `text.secondary` (its row
 * carries the «Архив» badge).
 */
export const detailLinkSx = (archived = false): SxProps<Theme> => ({
	color: archived ? "text.secondary" : "primary.main",
	fontWeight: 600,
	fontSize: "inherit",
	verticalAlign: "baseline",
});

/** A link inside a clickable row opens its own target, never the row's. */
const stopRowClick = (e: React.SyntheticEvent) => e.stopPropagation();

interface DetailLinkProps {
	/** Concrete detail route — resolve from routing/paths.ts, never a string literal. */
	to: string;
	children: React.ReactNode;
	archived?: boolean;
}

/**
 * Canonical detail-page link — the single place link styling lives. Per-entity
 * wrappers (PartnerLink, ProductLink, …) supply only the route + display text.
 * It owns colour, weight and click isolation, so call sites never wrap it.
 */
export const DetailLink: React.FC<DetailLinkProps> = ({ to, children, archived }) => (
	<Link
		component={RouterLink}
		to={to}
		underline="hover"
		onClick={stopRowClick}
		onKeyDown={stopRowClick}
		sx={detailLinkSx(archived)}
	>
		{children}
	</Link>
);

export default DetailLink;
