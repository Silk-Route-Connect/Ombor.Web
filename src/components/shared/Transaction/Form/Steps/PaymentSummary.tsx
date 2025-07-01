import React from "react";
import { Box, Divider, Typography } from "@mui/material";

export type TotalsBoxRow = {
	label: string;
	value: string | number;
};

interface TotalsBoxProps {
	rows: TotalsBoxRow[];
}

const TotalsBox: React.FC<TotalsBoxProps> = ({ rows }) => (
	<Box
		sx={{
			border: 1,
			borderColor: "divider",
			borderRadius: 2,
			px: 2,
			py: 1.5,
			width: "100%",
		}}
	>
		<Typography variant="subtitle2" sx={{ mb: 1 }}>
			Summary
		</Typography>
		<Divider sx={{ mb: 1 }} />
		{rows.map((r) => (
			<Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
				<Typography variant="body2" color="text.secondary">
					{r.label}
				</Typography>
				<Typography variant="body2" fontWeight={500}>
					{r.value}
				</Typography>
			</Box>
		))}
	</Box>
);

export default TotalsBox;
