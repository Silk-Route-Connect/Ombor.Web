import React, { FC } from "react";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, IconButton, Menu, MenuItem, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { translate } from "i18n/i18n";

import { ChartType } from "../TimeSeriesChart";

interface ChartControlsProps {
	chartType: ChartType;
	onChartTypeChange: (type: ChartType) => void;
	exportAnchor: HTMLElement | null;
	onOpenExport: (e: React.MouseEvent<HTMLElement>) => void;
	onCloseExport: () => void;
}

const ChartControls: FC<ChartControlsProps> = ({
	chartType,
	exportAnchor,
	onChartTypeChange,
	onOpenExport,
	onCloseExport,
}) => (
	<Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 1, gap: 2 }}>
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
			<MenuItem>{translate("reportExportPNG")}</MenuItem>
			<MenuItem>{translate("reportExportPDF")}</MenuItem>
			<MenuItem>{translate("reportExportCSV")}</MenuItem>
		</Menu>
	</Box>
);

export default ChartControls;
