import React from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import { designTokens, radius } from "theme";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
			icon={<PaymentsOutlinedIcon />}
			title={t("settings.currency.title")}
			subtitle={t("settings.currency.subtitle")}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					p: "10px 14px",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
					bgcolor: designTokens.bgSubtle,
					fontSize: 14,
					fontWeight: 600,
				}}
			>
				{t("settings.currency.locked")}
				<LockOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", ml: "auto" }} />
			</Box>
			<Callout tone="info" sx={{ mt: "12px" }}>
				{t("settings.currency.note")}
			</Callout>
		</SettingsSectionCard>
	);
};

export default CurrencySection;
