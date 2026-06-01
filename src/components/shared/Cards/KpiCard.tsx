import React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

type TrendPoint = { value: number };

export interface KpiCardProps {
	label: string;
	value: string | number;
	trend?: TrendPoint[];
	minHeight?: number;
	"data-testid"?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
	label,
	value,
	trend = [],
	minHeight = 140,
	...rest
}) => {
	const theme = useTheme();

	return (
		<Card
			{...rest}
			elevation={1}
			sx={{
				bgcolor: "background.paper",
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5, // 12px (--r-lg)
				minHeight,
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
			}}
		>
			<CardContent sx={{ flexGrow: 1, p: 2.5 }}>
				<Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 600 }}>
					{label}
				</Typography>

				<Typography
					sx={{
						mt: 1,
						mb: 0.5,
						fontSize: "1.625rem", // 26px — numeric hero (--fs-num-strong)
						fontWeight: 700,
						letterSpacing: "-0.02em",
						lineHeight: 1.1,
						color: "text.primary",
						fontVariantNumeric: "tabular-nums",
					}}
				>
					{value}
				</Typography>

				{trend.length > 0 && (
					<Box sx={{ height: 50, mt: 1 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
								<XAxis dataKey="value" hide />
								<YAxis hide domain={["dataMin", "dataMax"]} />
								<Line
									type="monotone"
									dataKey="value"
									stroke={theme.palette.primary.main}
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</Box>
				)}
			</CardContent>
		</Card>
	);
};

export default KpiCard;
