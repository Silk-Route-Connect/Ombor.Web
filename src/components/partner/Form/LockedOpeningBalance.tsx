import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Partner } from "models/partner";
import { designTokens, numericSx, radius } from "theme";
import { formatDate as formatLocaleDate } from "utils/dateUtils";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

/**
 * Locked opening-balance card shown on edit — the auditable event is read-only.
 * It sits under the «Начальный баланс» section heading, so it leads with when
 * the figure was recorded rather than repeating the title.
 */
export const LockedOpeningBalance: React.FC<{ partner: Partner }> = ({ partner }) => {
	const { t } = useTranslation();
	return (
		<Box
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				bgcolor: designTokens.bgSubtle,
				p: "14px 16px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary" }}>
					{t("partner.form.openingLockedSub", { date: formatLocaleDate(partner.openingDate) })}
				</Typography>
				<Box
					sx={{
						ml: "auto",
						...numericSx,
						fontWeight: 700,
						fontSize: 20,
						color: partnerBalanceColor(partner.openingBalance),
					}}
				>
					{formatPartnerBalance(partner.openingBalance)}
					<UzsUnit />
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					gap: "9px",
					alignItems: "flex-start",
					mt: "12px",
					p: "11px 13px",
					bgcolor: "primary.light",
					border: "1px solid",
					borderColor: designTokens.primaryLine,
					borderRadius: "8px",
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, color: "info.main", mt: "1px", flex: "0 0 auto" }} />
				<Typography sx={{ fontSize: 13, color: "info.main", lineHeight: 1.55 }}>
					{t("partner.form.openingLockedHelper", {
						balance: formatPartnerBalance(partner.balance),
					})}
				</Typography>
			</Box>
		</Box>
	);
};

export default LockedOpeningBalance;
