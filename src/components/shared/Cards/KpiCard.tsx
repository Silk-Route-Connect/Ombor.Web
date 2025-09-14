import React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Box, Card, CardContent, Typography } from "@mui/material";

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
	return (
		<Card
			{...rest}
			sx={{
				bgcolor: "primary.light",
				color: "primary.contrastText",
				borderRadius: 2,
				minHeight,
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
			}}
		>
			<CardContent sx={{ flexGrow: 1, p: 2 }}>
				<Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
					{label}
				</Typography>

				<Typography variant="h6" sx={{ my: 1, lineHeight: 1 }}>
					{value}
				</Typography>

				{trend.length > 0 && (
					<Box sx={{ height: 50 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
								<XAxis dataKey="value" hide />
								<YAxis hide domain={["dataMin", "dataMax"]} />
								<Line
									type="monotone"
									dataKey="value"
									stroke="currentColor"
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
