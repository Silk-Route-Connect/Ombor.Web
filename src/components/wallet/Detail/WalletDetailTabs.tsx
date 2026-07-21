import React from "react";
import { useTranslation } from "react-i18next";
import { numericSx } from "theme";

import { Box, ButtonBase } from "@mui/material";

export type WalletDetailTab = "operations" | "transfers";

interface WalletDetailTabsProps {
	value: WalletDetailTab;
	operationsCount: number;
	transfersCount: number;
	onChange: (tab: WalletDetailTab) => void;
}

/** Underline tabs per the bundle's `.prod-tabs`: «Операции» / «Переводы» with counts. */
export const WalletDetailTabs: React.FC<WalletDetailTabsProps> = ({
	value,
	operationsCount,
	transfersCount,
	onChange,
}) => {
	const { t } = useTranslation();

	const tabs: Array<{ key: WalletDetailTab; label: string; count: number }> = [
		{ key: "operations", label: t("wallet.detail.tabs.operations"), count: operationsCount },
		{ key: "transfers", label: t("wallet.detail.tabs.transfers"), count: transfersCount },
	];

	return (
		<Box sx={{ display: "flex", gap: "4px", borderBottom: 1, borderColor: "divider" }}>
			{tabs.map((tab) => {
				const selected = tab.key === value;
				return (
					<ButtonBase
						key={tab.key}
						onClick={() => onChange(tab.key)}
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "7px",
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
								...numericSx,
								fontSize: 12,
								fontWeight: 600,
								px: "7px",
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
};

export default WalletDetailTabs;
