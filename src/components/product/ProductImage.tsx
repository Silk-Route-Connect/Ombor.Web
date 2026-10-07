import React, { useState } from "react";
import { designTokens, identityTone } from "theme";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, SxProps, Theme } from "@mui/material";

interface ProductImageProps {
	/** The resolved image URL (`getImageFullUrl`); none → the placeholder. */
	src: string | undefined;
	alt: string;
	/** The product name the placeholder's letter and tint come from (defaults to `alt`). */
	name?: string;
	/** Square side in px. */
	size: number;
	radius: number;
	/** Archived product: the placeholder turns neutral. */
	muted?: boolean;
	/** Frame extras (border, opacity) — applied to the image and the placeholder alike. */
	sx?: SxProps<Theme>;
}

/**
 * A product picture, or a placeholder when the product has none or the file
 * fails to load (a missing upload never shows a broken image or its alt text):
 * the name's first letter on its identity tint, so a catalogue without photos
 * is still told apart at a glance. The one image look of the product list,
 * detail and form.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
	src,
	alt,
	name = alt,
	size,
	radius,
	muted = false,
	sx,
}) => {
	// Keyed by URL so a new picture gets its own chance to load.
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const showImage = Boolean(src) && failedSrc !== src;
	const tone = identityTone(name);
	const letter = name.trim().charAt(0).toUpperCase();

	return (
		<Box
			sx={[
				{
					width: size,
					height: size,
					flex: "0 0 auto",
					borderRadius: `${radius}px`,
					overflow: "hidden",
					display: "inline-grid",
					placeItems: "center",
					bgcolor: muted ? designTokens.gray100 : tone.bg,
					color: muted ? "text.secondary" : tone.fg,
				},
				...(sx === undefined ? [] : Array.isArray(sx) ? sx : [sx]),
			]}
		>
			{showImage ? (
				<Box
					component="img"
					src={src}
					alt={alt}
					onError={() => setFailedSrc(src ?? null)}
					sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
				/>
			) : letter ? (
				<Box
					component="span"
					aria-hidden
					sx={{ fontWeight: 700, fontSize: Math.min(Math.round(size * 0.42), 40), lineHeight: 1 }}
				>
					{letter}
				</Box>
			) : (
				<Inventory2OutlinedIcon sx={{ fontSize: Math.min(Math.round(size / 2), 40) }} />
			)}
		</Box>
	);
};

export default ProductImage;
