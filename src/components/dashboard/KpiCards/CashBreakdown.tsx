import React from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import UzsUnit from "components/shared/Money/UzsUnit";
import { DashboardWalletBalance } from "models/dashboard";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

/** The cash card's per-wallet balances (served, in the served order) — its hover / focus tooltip. */
export const CashBreakdown: React.FC<{ wallets: DashboardWalletBalance[] }> = ({ wallets }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ minWidth: 220, py: "2px" }}>
			<Typography sx={{ fontSize: 12, fontWeight: 600, mb: "6px" }}>
				{t("dashboard.kpi.cashBreakdown")}
			</Typography>
			{wallets.length === 0 ? (
				<Typography sx={{ fontSize: 12 }}>{t("dashboard.kpi.noWallets")}</Typography>
			) : (
				wallets.map((w) => (
					<Box
						key={w.id}
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "16px",
							fontSize: 12,
							py: "2px",
						}}
					>
						<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
							{w.name}
							{w.isArchived && <ArchivedBadge />}
						</Box>
						<Box component="span" sx={{ ...numericSx, fontWeight: 600, whiteSpace: "nowrap" }}>
							{formatCurrency(w.balance)}
							<UzsUnit sx={{ color: "inherit", fontSize: 11 }} />
						</Box>
					</Box>
				))
			)}
		</Box>
	);
};

export default CashBreakdown;
