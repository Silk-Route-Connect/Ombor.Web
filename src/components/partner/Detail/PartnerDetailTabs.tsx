import React from "react";

import { Box, ButtonBase } from "@mui/material";

export type PartnerDetailTab = "ledger" | "transactions" | "payments";

interface TabSpec {
	value: PartnerDetailTab;
	label: string;
	count: number;
}

interface PartnerDetailTabsProps {
	value: PartnerDetailTab;
	tabs: TabSpec[];
	onChange: (tab: PartnerDetailTab) => void;
}

/** Underline tabs per the bundle's `.prod-tabs` with a count badge. */
export const PartnerDetailTabs: React.FC<PartnerDetailTabsProps> = ({ value, tabs, onChange }) => (
	<Box sx={{ display: "flex", gap: "4px", borderBottom: 1, borderColor: "divider" }}>
		{tabs.map((tab) => {
			const selected = tab.value === value;
			return (
				<ButtonBase
					key={tab.value}
					onClick={() => onChange(tab.value)}
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						p: "11px 14px",
						mb: "-1px",
						fontSize: 14,
						fontFamily: "inherit",
						fontWeight: selected ? 600 : 500,
						color: selected ? "primary.main" : "text.secondary",
						borderBottom: "2px solid",
						borderColor: selected ? "primary.main" : "transparent",
						"&:hover": { color: selected ? "primary.main" : "text.primary" },
					}}
				>
					{tab.label}
					<Box
						component="span"
						sx={{
							fontSize: 11,
							fontWeight: 700,
							minWidth: 18,
							px: "6px",
							py: "1px",
							borderRadius: "999px",
							bgcolor: selected ? "primary.light" : "grey.100",
							color: selected ? "primary.main" : "text.secondary",
						}}
					>
						{tab.count}
					</Box>
				</ButtonBase>
			);
		})}
	</Box>
);

export default PartnerDetailTabs;
