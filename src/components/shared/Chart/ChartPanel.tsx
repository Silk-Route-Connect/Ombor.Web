import React from "react";
import SegmentedControl, {
	SegmentedOption,
} from "components/shared/SegmentedControl/SegmentedControl";
import { radius } from "theme";

import { Box, Paper, Typography } from "@mui/material";

import { LegendKey } from "./LegendSwatch";

export type LegendItem = { label: string; color: string };

/** The line / bar toggle of a chart that can switch its look. */
export interface ChartTypeToggle<T extends string> {
	value: T;
	options: SegmentedOption<T>[];
	onChange: (value: T) => void;
}

interface ChartPanelProps<T extends string> {
	title: string;
	subtitle?: string;
	legend: LegendItem[];
	/** Optional line / bar toggle on the right of the head row. */
	typeToggle?: ChartTypeToggle<T>;
	/** Extra toolbar control to the left of the type toggle (e.g. wallet filter). */
	extra?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Chart container (the bundle's `.panel` / `.chart-head` / `.chart-legend`): a
 * bordered surface card with a title block, a right-aligned toolbar (optional
 * `extra` + an optional line/bar toggle), a colour legend and the chart body.
 * Dashboard charts and every report chart sit in it.
 */
export function ChartPanel<T extends string = string>({
	title,
	subtitle,
	legend,
	typeToggle,
	extra,
	children,
}: Readonly<ChartPanelProps<T>>) {
	return (
		<Paper
			elevation={1}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
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
					<Typography variant="h3" component="h2">
						{title}
					</Typography>
					{subtitle && (
						<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "3px" }}>
							{subtitle}
						</Typography>
					)}
				</Box>
				{(extra || typeToggle) && (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 0 auto" }}>
						{extra}
						{typeToggle && (
							<SegmentedControl
								options={typeToggle.options}
								value={typeToggle.value}
								onChange={typeToggle.onChange}
							/>
						)}
					</Box>
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					gap: "6px 18px",
					p: "12px 20px 0",
				}}
			>
				{legend.map((l) => (
					<LegendKey key={l.label} color={l.color} label={l.label} />
				))}
			</Box>

			<Box sx={{ flex: "1 1 auto", p: "8px 8px 12px", minWidth: 0 }}>{children}</Box>
		</Paper>
	);
}

export default ChartPanel;
