import React from "react";
import { designTokens } from "theme";

import { useTheme } from "@mui/material";

/**
 * Colour version of the mark (Design → «Ombor Logo - Monogram»):
 * - `tile`     — positive: teal rounded plate, white ring, saffron keystone. On light surfaces.
 * - `reversed` — no plate, white ring, saffron keystone. On the teal brand panel.
 * - `monoTeal` — single teal, ring + keystone. Watermarks / one-colour print on light.
 * - `monoWhite`— single white, ring + keystone. On dark / photographic backgrounds.
 */
export type OmborMarkVariant = "tile" | "reversed" | "monoTeal" | "monoWhite";

interface OmborMarkProps {
	/** Rendered box, in px (square). The mark scales as vector; min legible size ≈ 20. */
	size?: number;
	variant?: OmborMarkVariant;
	/** Accessible label; empty string renders the mark as decorative (aria-hidden). */
	title?: string;
}

/*
 * Geometry on the design's 64×64 grid — do not tweak (Design «Построение»):
 * the ring is an «О» of constant width with round caps, open ~36° at the top;
 * the saffron keystone («замковый камень») is a trapezoid that locks the gap,
 * so the letter also reads as an arched portal.
 */
const RING = "M36.33 18.68 A14 14 0 1 1 27.67 18.68";
const KEY = "M29 22 L27 13.5 Q32 12.3 37 13.5 L35 22 Z";

/** The Ombor brand monogram, rendered inline as SVG so it inherits crisp vector scaling. */
const OmborMark: React.FC<OmborMarkProps> = ({ size = 34, variant = "tile", title = "Ombor" }) => {
	const teal = useTheme().palette.primary.main; // --teal-500
	const white = designTokens.gray0; // --stone-0 (#FFFFFF)
	const keystone = designTokens.logoKeystone; // --amber-400 (DS accent)

	const plateFill = variant === "tile" ? teal : undefined;
	const ringStroke = variant === "monoTeal" ? teal : white;
	const keyFill = variant === "monoTeal" ? teal : variant === "monoWhite" ? white : keystone;

	const decorative = title.length === 0;

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 64 64"
			fill="none"
			role={decorative ? undefined : "img"}
			aria-label={decorative ? undefined : title}
			aria-hidden={decorative || undefined}
			style={{ display: "block", flexShrink: 0 }}
		>
			{plateFill && <rect width="64" height="64" rx="15" fill={plateFill} />}
			<path d={RING} fill="none" stroke={ringStroke} strokeWidth="8" strokeLinecap="round" />
			<path d={KEY} fill={keyFill} />
		</svg>
	);
};

export default OmborMark;
