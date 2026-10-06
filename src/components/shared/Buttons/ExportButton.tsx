import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "stores/StoreContext";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import GhostButton from "./GhostButton";

interface ExportButtonProps {
	/** Writes the CSV of the rows the table currently shows. */
	onExport: () => void;
	/** Rows the export would write; at 0 the button explains instead of downloading. */
	rowCount: number;
}

/**
 * The one «Экспорт» button — same label, icon and place on every table: the
 * title row of list pages (pattern 11), the in-card band of detail tabs. Never
 * disabled: with nothing to export it says so in a short info toast.
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, rowCount }) => {
	const { t } = useTranslation();
	const { notificationStore } = useStore();

	const handleClick = () => {
		if (rowCount === 0) {
			notificationStore.info(t("common.exportNothing"));
			return;
		}
		onExport();
	};

	return (
		<GhostButton icon={<FileDownloadOutlinedIcon />} onClick={handleClick}>
			{t("common.export")}
		</GhostButton>
	);
};

export default ExportButton;
