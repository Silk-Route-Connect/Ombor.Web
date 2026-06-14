import React from "react";
import { useTranslation } from "react-i18next";

import { Box, ButtonBase } from "@mui/material";

export type WarehouseDetailTab = "stock" | "movements";

interface WarehouseDetailTabsProps {
	value: WarehouseDetailTab;
	onChange: (tab: WarehouseDetailTab) => void;
}

const TABS: WarehouseDetailTab[] = ["stock", "movements"];

/** Underline tabs per the bundle's `.prod-tabs`: «Остатки» / «Движения». */
export const WarehouseDetailTabs: React.FC<WarehouseDetailTabsProps> = ({ value, onChange }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ display: "flex", gap: "4px", borderBottom: 1, borderColor: "divider" }}>
			{TABS.map((tab) => {
				const selected = tab === value;
				return (
					<ButtonBase
						key={tab}
						onClick={() => onChange(tab)}
						sx={{
							display: "inline-flex",
							alignItems: "center",
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
						{t(`warehouse.detail.tabs.${tab}`)}
					</ButtonBase>
				);
			})}
		</Box>
	);
};

export default WarehouseDetailTabs;
