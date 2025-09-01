import React, { useState } from "react";
import { translate } from "i18n/i18n";

import DownloadIcon from "@mui/icons-material/Download";
import { Button, Menu, MenuItem } from "@mui/material";

const DEFAULT_DOWNLOAD_OPTIONS: DownloadOptions[] = ["csv", "pdf", "png"];

export type DownloadOptions = "pdf" | "csv" | "png";

interface DownloadButtonProps {
	options?: DownloadOptions[];
	onDownload(option: DownloadOptions): void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
	options = DEFAULT_DOWNLOAD_OPTIONS,
	onDownload,
}) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const menuOpen = Boolean(anchorEl);
	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	return (
		<>
			<Button endIcon={<DownloadIcon />} onClick={handleMenuOpen} sx={{ textTransform: "none" }}>
				{translate("download")}
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={menuOpen}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{options.map((option) => (
					<MenuItem key={`download-menu-${option}`} onClick={() => onDownload(option)}>
						{translate(`common.download.${option}`)}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default DownloadButton;
