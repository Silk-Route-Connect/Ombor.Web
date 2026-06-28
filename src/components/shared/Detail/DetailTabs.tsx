import { designTokens, numericSx } from "theme";

import { Box, ButtonBase } from "@mui/material";

export interface DetailTabSpec<K extends string> {
	key: K;
	label: string;
	/** Optional count pill; omit to render the tab without a badge. */
	count?: number;
}

interface DetailTabsProps<K extends string> {
	tabs: DetailTabSpec<K>[];
	active: K;
	onChange: (key: K) => void;
}

/**
 * Shared detail-page underline tabs per the DSN-1 `.prod-tabs`/`.tab`: a 2px
 * primary underline on the active tab and an optional tabular count pill. Used
 * by every full-page detail layout so the tab chrome lives in one place.
 */
export function DetailTabs<K extends string>({ tabs, active, onChange }: DetailTabsProps<K>) {
	return (
		<Box sx={{ display: "flex", gap: "4px", borderBottom: 1, borderColor: "divider" }}>
			{tabs.map((tab) => {
				const selected = tab.key === active;
				return (
					<ButtonBase
						key={tab.key}
						onClick={() => onChange(tab.key)}
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
						{tab.count != null && (
							<Box
								component="span"
								sx={{
									...numericSx,
									fontSize: 11,
									fontWeight: 700,
									minWidth: 18,
									textAlign: "center",
									px: "7px",
									py: "1px",
									borderRadius: "999px",
									color: selected ? "primary.main" : "text.secondary",
									bgcolor: selected ? designTokens.primarySoft : designTokens.gray100,
								}}
							>
								{tab.count}
							</Box>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
}

export default DetailTabs;
