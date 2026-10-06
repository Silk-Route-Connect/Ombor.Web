import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Partner } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatDate as formatLocaleDate } from "utils/dateUtils";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

/** Locked opening-balance card shown on edit — the auditable event is read-only. */
export const LockedOpeningBalance: React.FC<{ partner: Partner }> = ({ partner }) => {
	const { t } = useTranslation();
	return (
		<Box
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				bgcolor: designTokens.gray25,
				p: "16px 18px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<Box
					sx={{
						width: 30,
						height: 30,
						borderRadius: "8px",
						display: "grid",
						placeItems: "center",
						bgcolor: "primary.light",
						color: "info.main",
						flex: "0 0 auto",
					}}
				>
					<FlagOutlinedIcon sx={{ fontSize: 16 }} />
				</Box>
				<Box>
					<Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
						{t("partner.form.openingLockedTitle")}
					</Typography>
					<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
						{t("partner.form.openingLockedSub", { date: formatLocaleDate(partner.openingDate) })}
					</Typography>
				</Box>
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
				<Typography sx={{ fontSize: 12.5, color: "info.main", lineHeight: 1.55 }}>
					{t("partner.form.openingLockedHelper", {
						balance: formatPartnerBalance(partner.balance),
					})}
				</Typography>
			</Box>
		</Box>
	);
};

export default LockedOpeningBalance;
