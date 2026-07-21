import React from "react";
import SegmentedControl, {
	SegmentedOption,
} from "components/shared/SegmentedControl/SegmentedControl";

import { Box, Paper, Typography } from "@mui/material";

export type LegendItem = { label: string; color: string };

interface ChartPanelProps<T extends string> {
	title: string;
	subtitle: string;
	legend: LegendItem[];
	chartType: T;
	typeOptions: SegmentedOption<T>[];
	onChartType: (value: T) => void;
	/** Extra toolbar control to the left of the type toggle (e.g. wallet filter). */
	extra?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Chart container per the bundle's `.panel` / `.chart-head` / `.chart-legend`:
 * a bordered surface card with a title block, a right-aligned toolbar (optional
 * `extra` + a line/bar type toggle), a colour legend, and the chart body. The
 * download button from the prototype is intentionally omitted — dashboard export
 * is deferred to the Reports module (v2).
 */
export function ChartPanel<T extends string>({
	title,
	subtitle,
	legend,
	chartType,
	typeOptions,
	onChartType,
	extra,
	children,
}: Readonly<ChartPanelProps<T>>) {
	return (
		<Paper
			elevation={1}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: 2,
					p: "16px 20px 0",
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
						{title}
					</Typography>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
						{subtitle}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 0 auto" }}>
					{extra}
					<SegmentedControl options={typeOptions} value={chartType} onChange={onChartType} />
				</Box>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: "18px", p: "12px 20px 0" }}>
				{legend.map((l) => (
					<Box
						key={l.label}
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							fontSize: 12.5,
							color: "text.secondary",
						}}
					>
						<Box sx={{ width: 11, height: 11, borderRadius: "3px", bgcolor: l.color }} />
						{l.label}
					</Box>
				))}
			</Box>

			<Box sx={{ flex: "1 1 auto", p: "8px 8px 12px", minWidth: 0 }}>{children}</Box>
		</Paper>
	);
}

export default ChartPanel;
