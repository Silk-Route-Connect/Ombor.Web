import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

/**
 * Валюта — informational, read-only. The app is UZS-only (rule 33 / hard rule 4);
 * multi-currency is a future version. Nothing here is editable.
 */
const CurrencySection: React.FC = () => {
	const { t } = useTranslation();

	return (
		<SettingsSectionCard
			id="currency"
			icon={<PaymentsOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("settings.currency.title")}
			subtitle={t("settings.currency.subtitle")}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					p: "11px 14px",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: "8px",
					bgcolor: designTokens.gray25,
					fontSize: 14,
					fontWeight: 600,
				}}
			>
				{t("settings.currency.locked")}
				<InfoOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", ml: "auto" }} />
			</Box>
			<Box
				sx={{
					mt: "12px",
					display: "flex",
					gap: "9px",
					p: "12px 14px",
					fontSize: 12.5,
					lineHeight: 1.55,
					color: "text.secondary",
					bgcolor: designTokens.infoBg,
					border: "1px solid",
					borderColor: designTokens.infoBorder,
					borderRadius: "8px",
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, color: "info.main", flex: "0 0 auto", mt: "1px" }} />
				{t("settings.currency.note")}
			</Box>
		</SettingsSectionCard>
	);
};

export default CurrencySection;
