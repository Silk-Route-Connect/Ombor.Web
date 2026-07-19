import React from "react";
import { designTokens, numericSx } from "theme";
import { formatBytes } from "utils/formatBytes";
import { getImageFullUrl } from "utils/productUtils";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Box, Typography } from "@mui/material";

export interface AttachmentChipProps {
	name: string;
	/** MIME type — drives the icon (image vs document). */
	contentType: string;
	/** File size in bytes (served as int64); rendered via `formatBytes`. */
	sizeBytes: number;
	/** Download URL; opens in a new tab. */
	url: string;
}

/**
 * A single downloadable file chip — a MIME-typed icon (image vs document), the
 * file name, and its size. Shared by the transaction and payment detail
 * attachment lists (F7 / F18) so the chip is authored once.
 */
const AttachmentChip: React.FC<AttachmentChipProps> = ({ name, contentType, sizeBytes, url }) => {
	const isImage = contentType.startsWith("image/");
	// The backend serves a relative file path; resolve it against the API base so the
	// download link is fetchable (shared resolver, same as product images).
	const href = getImageFullUrl(url);
	return (
		<Box
			component="a"
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "11px",
				p: "9px 13px 9px 10px",
				border: "1px solid",
				borderColor: designTokens.gray300,
				borderRadius: "8px",
				cursor: "pointer",
				textDecoration: "none",
				color: "inherit",
				"&:hover": { borderColor: designTokens.primaryLine, bgcolor: "primary.light" },
			}}
		>
			<Box
				sx={{
					width: 32,
					height: 32,
					borderRadius: "7px",
					display: "grid",
					placeItems: "center",
					flex: "0 0 auto",
					...(isImage
						? { bgcolor: "rgba(42,111,151,0.12)", color: "info.main" }
						: { bgcolor: designTokens.errorBg, color: "error.main" }),
				}}
			>
				{isImage ? (
					<ImageOutlinedIcon sx={{ fontSize: 17 }} />
				) : (
					<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />
				)}
			</Box>
			<Box>
				<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{name}</Typography>
				<Typography sx={{ ...numericSx, fontSize: 11.5, color: "text.disabled", mt: "1px" }}>
					{formatBytes(sizeBytes)}
				</Typography>
			</Box>
		</Box>
	);
};

export default AttachmentChip;
