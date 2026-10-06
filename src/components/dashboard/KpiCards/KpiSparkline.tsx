import React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { Box, useTheme } from "@mui/material";

import { usePrefersReducedMotion } from "../motion";
import { KpiCardSpec } from "./types";

const SPARK_HEIGHT = 34;

/**
 * The card's trend line from the served per-bucket points. With fewer than two
 * points (stock value has no served history) the slot stays empty, so the cards
 * of a row keep one height — a line is never drawn from invented data.
 */
export const KpiSparkline: React.FC<{ trend: number[]; spark: KpiCardSpec["spark"] }> = ({
	trend,
	spark,
}) => {
	const reduced = usePrefersReducedMotion();
	const theme = useTheme();

	return (
		<Box
			className="kpi-spark"
			aria-hidden
			sx={{
				height: SPARK_HEIGHT,
				mt: "10px",
				mx: "-2px",
				opacity: 0.85,
				transition: "opacity .15s",
			}}
		>
			{trend.length > 1 && (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={trend.map((value) => ({ value }))}
						margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
					>
						<Line
							type="monotone"
							dataKey="value"
							stroke={theme.palette[spark].main}
							strokeWidth={2}
							dot={false}
							isAnimationActive={!reduced}
							animationDuration={900}
							animationEasing="ease-out"
						/>
					</LineChart>
				</ResponsiveContainer>
			)}
		</Box>
	);
};

export default KpiSparkline;
