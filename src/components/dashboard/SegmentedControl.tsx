import React from "react";

import { Box } from "@mui/material";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	size?: "sm" | "md";
}

/** Design `.seg` segmented control: pill group, active item is a raised white chip. */
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	size = "md",
}: Readonly<SegmentedControlProps<T>>) {
	const pad = size === "sm" ? "5px 11px" : "6px 13px";
	const fontSize = size === "sm" ? "0.75rem" : "0.8125rem";

	return (
		<Box
			sx={{
				display: "inline-flex",
				gap: 0.25,
				p: "3px",
				borderRadius: 2,
				bgcolor: "grey.100",
			}}
		>
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<Box
						key={opt.value}
						role="button"
						onClick={() => onChange(opt.value)}
						sx={{
							px: 0,
							py: 0,
							padding: pad,
							fontSize,
							fontWeight: active ? 600 : 500,
							lineHeight: 1.2,
							borderRadius: 1.5,
							cursor: "pointer",
							whiteSpace: "nowrap",
							color: active ? "text.primary" : "text.secondary",
							bgcolor: active ? "background.paper" : "transparent",
							boxShadow: active ? 1 : "none",
							transition: "background-color .12s, color .12s",
							"&:hover": { color: "text.primary" },
						}}
					>
						{opt.label}
					</Box>
				);
			})}
		</Box>
	);
}

export default SegmentedControl;
