import React from "react";
import { useTranslation } from "react-i18next";
import { DebtTab } from "stores/DebtStore";
import { numericSx } from "theme";

import { Box, ButtonBase } from "@mui/material";

interface DebtTabsProps {
	value: DebtTab;
	partnersCount: number;
	transactionsCount: number;
	onChange: (tab: DebtTab) => void;
}

const LegendSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
	<Box
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "7px",
			fontSize: 12.5,
			color: "text.secondary",
		}}
	>
		<Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: color }} />
		{label}
	</Box>
);

/** Two underline tabs + the sign-convention legend (the bundle's `.debt-tabs`). */
export const DebtTabs: React.FC<DebtTabsProps> = ({
	value,
	partnersCount,
	transactionsCount,
	onChange,
}) => {
	const { t } = useTranslation();

	const tabs: Array<{ key: DebtTab; label: string; count: number }> = [
		{ key: "partners", label: t("debt.tabs.partners"), count: partnersCount },
		{ key: "transactions", label: t("debt.tabs.transactions"), count: transactionsCount },
	];

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "4px",
				borderBottom: 1,
				borderColor: "divider",
				mb: "18px",
			}}
		>
			{tabs.map((tab) => {
				const selected = tab.key === value;
				return (
					<ButtonBase
						key={tab.key}
						onClick={() => onChange(tab.key)}
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "9px",
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
								fontWeight: 700,
								px: "8px",
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

			<Box
				sx={{ ml: "auto", display: { xs: "none", sm: "flex" }, alignItems: "center", gap: "20px" }}
			>
				<LegendSwatch color="#17835A" label={t("debt.legend.receivable")} />
				<LegendSwatch color="#C53D31" label={t("debt.legend.payable")} />
			</Box>
		</Box>
	);
};

export default DebtTabs;
