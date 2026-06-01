import React from "react";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	value: T;
	options: SegmentedOption<T>[];
	onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
	value,
	options,
	onChange,
}: SegmentedControlProps<T>) {
	return (
		<ToggleButtonGroup
			exclusive
			size="small"
			value={value}
			onChange={(_, next) => {
				if (next !== null) {
					onChange(next as T);
				}
			}}
			sx={{
				bgcolor: "grey.50",
				borderRadius: 1,
				p: 0.5,
				gap: 0.5,
				"& .MuiToggleButton-root": {
					border: 0,
					borderRadius: 1,
					px: 1.5,
					py: 0.5,
					textTransform: "none",
					fontWeight: 600,
					fontSize: "0.8125rem",
					color: "text.secondary",
					"&.Mui-selected": {
						bgcolor: "background.paper",
						color: "text.primary",
						boxShadow: 1,
						"&:hover": { bgcolor: "background.paper" },
					},
				},
			}}
		>
			{options.map((opt) => (
				<ToggleButton key={opt.value} value={opt.value}>
					{opt.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}

export default SegmentedControl;
