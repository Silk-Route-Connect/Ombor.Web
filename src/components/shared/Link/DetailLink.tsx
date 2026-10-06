import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Link, SxProps, Theme } from "@mui/material";

/**
 * `primary` — the № link and a row's primary entity (teal, 600). `secondary` —
 * a supporting entity in the same row (the warehouse of an adjustment, the
 * wallet of a payment): ink at the body weight, teal only on hover / focus, so
 * a row reads as one link to follow, not a wall of teal.
 */
export type DetailLinkVariant = "primary" | "secondary";

/**
 * The one entity-link look: the surrounding text size, an underline on hover.
 * An archived entity reads in `text.secondary` (its row carries the «Архив» badge).
 */
export const detailLinkSx = (
	archived = false,
	variant: DetailLinkVariant = "primary",
): SxProps<Theme> =>
	variant === "secondary"
		? {
				color: archived ? "text.secondary" : "text.primary",
				fontWeight: 400,
				fontSize: "inherit",
				verticalAlign: "baseline",
				"&:hover, &:focus-visible": { color: "primary.main", textDecoration: "underline" },
			}
		: {
				color: archived ? "text.secondary" : "primary.main",
				fontWeight: 600,
				fontSize: "inherit",
				verticalAlign: "baseline",
			};

/** A link inside a clickable row opens its own target, never the row's. */
const stopRowClick = (e: React.SyntheticEvent) => e.stopPropagation();

/** A plain left click (or Enter) — not a click meant to open a new tab or window. */
export const isPlainClick = (e: React.MouseEvent) =>
	e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

interface DetailLinkProps {
	/** Concrete detail route — resolve from routing/paths.ts, never a string literal. */
	to: string;
	children: React.ReactNode;
	archived?: boolean;
	/** `secondary` for a supporting entity column (see {@link DetailLinkVariant}). */
	variant?: DetailLinkVariant;
	/**
	 * Opens the target in place (a modal over the current page) on a plain click;
	 * Ctrl / ⌘ / middle click still open `to` in a new tab.
	 */
	onOpen?: () => void;
}

/**
 * Canonical detail-page link — the single place link styling lives. Per-entity
 * wrappers (PartnerLink, ProductLink, …) supply only the route + display text.
 * It owns colour, weight and click isolation, so call sites never wrap it.
 */
export const DetailLink: React.FC<DetailLinkProps> = ({
	to,
	children,
	archived,
	variant,
	onOpen,
}) => (
	<Link
		component={RouterLink}
		to={to}
		underline="hover"
		onClick={(e: React.MouseEvent) => {
			stopRowClick(e);
			if (onOpen && isPlainClick(e)) {
				e.preventDefault();
				onOpen();
			}
		}}
		onKeyDown={stopRowClick}
		sx={detailLinkSx(archived, variant)}
	>
		{children}
	</Link>
);

export default DetailLink;
