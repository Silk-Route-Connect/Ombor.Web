import React from "react";
import { translate } from "i18n/i18n";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Button, Typography } from "@mui/material";

import { DashboardPeriod } from "../../models/dashboard";
import SegmentedControl from "./SegmentedControl";

interface DashboardHeaderProps {
	subtitle: string;
	period: DashboardPeriod;
	onPeriodChange: (period: DashboardPeriod) => void;
	onExport: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	subtitle,
	period,
	onPeriodChange,
	onExport,
}) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "flex-start",
			justifyContent: "space-between",
			flexWrap: "wrap",
			gap: 2,
			mb: 3,
		}}
	>
		<Box>
			<Typography variant="h1">{translate("dashboard.title")}</Typography>
			<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
				{subtitle}
			</Typography>
		</Box>
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
			<SegmentedControl<DashboardPeriod>
				value={period}
				onChange={onPeriodChange}
				options={[
					{ value: "today", label: translate("dashboard.period.today") },
					{ value: "week", label: translate("dashboard.period.week") },
					{ value: "month", label: translate("dashboard.period.month") },
				]}
			/>
			<Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={onExport}>
				{translate("dashboard.export")}
			</Button>
		</Box>
	</Box>
);

export default DashboardHeader;
