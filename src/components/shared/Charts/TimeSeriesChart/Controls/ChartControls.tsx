import React, { FC } from "react";
import { translate } from "i18n/i18n";

import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, IconButton, Menu, MenuItem, ToggleButton, ToggleButtonGroup } from "@mui/material";

import { ChartType } from "../TimeSeriesChart";

interface ChartControlsProps {
	chartType: ChartType;
	exportAnchor: HTMLElement | null;
	title?: React.ReactNode;
	onChartTypeChange: (type: ChartType) => void;
	onOpenExport: (e: React.MouseEvent<HTMLElement>) => void;
	onCloseExport: () => void;
}

const ChartControls: FC<ChartControlsProps> = ({
	chartType,
	exportAnchor,
	title,
	onChartTypeChange,
	onOpenExport,
	onCloseExport,
}) => {
	const hasLeft = Boolean(title);

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: hasLeft ? "space-between" : "flex-end",
				gap: 2,
				mb: 1,
			}}
		>
			{hasLeft && <Box sx={{ minWidth: 0 }}>{title}</Box>}

			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<ToggleButtonGroup
					value={chartType}
					exclusive
					size="small"
					onChange={(_, v) => v && onChartTypeChange(v)}
				>
					<ToggleButton value="line">
						<ShowChartIcon />
					</ToggleButton>
					<ToggleButton value="bar">
						<BarChartIcon />
					</ToggleButton>
				</ToggleButtonGroup>

				<IconButton onClick={onOpenExport} size="small">
					<DownloadIcon />
				</IconButton>

				<Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={onCloseExport}>
					<MenuItem onClick={onCloseExport}>{translate("reportExportPNG")}</MenuItem>
					<MenuItem onClick={onCloseExport}>{translate("reportExportPDF")}</MenuItem>
					<MenuItem onClick={onCloseExport}>{translate("reportExportCSV")}</MenuItem>
				</Menu>
			</Box>
		</Box>
	);
};

export default ChartControls;
