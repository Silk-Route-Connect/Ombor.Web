import React from "react";
import { translate } from "i18n/i18n";
import { downloadNodeAsPng } from "utils/downloadImage";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { IconButton, Tooltip } from "@mui/material";

interface ChartDownloadButtonProps {
	/** Ref to the panel node to rasterize. */
	target: React.RefObject<HTMLElement | null>;
	fileName: string;
}

/** Per-chart PNG download (design `.chart-dl`). */
const ChartDownloadButton: React.FC<ChartDownloadButtonProps> = ({ target, fileName }) => {
	const handleDownload = async () => {
		if (target.current) {
			await downloadNodeAsPng(target.current, fileName);
		}
	};

	return (
		<Tooltip title={translate("dashboard.chart.downloadPng")} arrow enterDelay={300}>
			<IconButton
				size="small"
				onClick={handleDownload}
				sx={{
					border: 1,
					borderColor: "divider",
					borderRadius: 1.5,
					color: "text.secondary",
					"&:hover": { bgcolor: "grey.50", color: "text.primary" },
				}}
			>
				<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
			</IconButton>
		</Tooltip>
	);
};

export default ChartDownloadButton;
