import React from "react";
import { designTokens, numericSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";

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
	/** Content on the right of the tab row, outside the tablist (e.g. a legend). */
	trailing?: React.ReactNode;
}

/**
 * Shared underline tabs per the DSN-1 `.prod-tabs`/`.tab`: a 2px primary
 * underline on the active tab and an optional tabular count pill. Used by every
 * full-page detail layout and the Debts page so the tab chrome lives in one place.
 */
export function DetailTabs<K extends string>({
	tabs,
	active,
	onChange,
	trailing,
}: DetailTabsProps<K>) {
	return (
		<Box sx={{ display: "flex", borderBottom: 1, borderColor: "divider" }}>
			<Box role="tablist" sx={{ display: "flex", gap: "4px", minWidth: 0 }}>
				{tabs.map((tab) => {
					const selected = tab.key === active;
					return (
						<ButtonBase
							key={tab.key}
							role="tab"
							aria-selected={selected}
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
										borderRadius: `${radius.pill}px`,
										color: selected ? "primary.main" : "text.secondary",
										bgcolor: selected ? designTokens.primarySoft : designTokens.gray100,
									}}
								>
									{formatQuantity(tab.count)}
								</Box>
							)}
						</ButtonBase>
					);
				})}
			</Box>
			{trailing && (
				<Box sx={{ ml: "auto", pl: 2, display: "flex", alignItems: "center" }}>{trailing}</Box>
			)}
		</Box>
	);
}

export default DetailTabs;
