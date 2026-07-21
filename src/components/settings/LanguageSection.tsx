import React from "react";
import { useTranslation } from "react-i18next";
import { UI_LANGUAGES } from "i18n/languages";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

interface Props {
	currentCode: string;
	onSelect: (code: string) => void;
}

/**
 * Язык — per-user interface language (mvp-plan §18). Applies immediately (the
 * same per-account setting as the Topbar globe), so it is not part of the
 * organization save bar. Options come from the shared `UI_LANGUAGES` list.
 */
const LanguageSection: React.FC<Props> = ({ currentCode, onSelect }) => {
	const { t } = useTranslation();

	return (
		<SettingsSectionCard
			id="lang"
			icon={<LanguageIcon sx={{ fontSize: 17 }} />}
			title={t("settings.lang.title")}
			subtitle={t("settings.lang.subtitle")}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				{UI_LANGUAGES.map((lang) => {
					const on = lang.code === currentCode;
					return (
						<Box
							key={lang.code}
							onClick={() => onSelect(lang.code)}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "14px",
								p: "15px 18px",
								border: "1.5px solid",
								borderColor: on ? "primary.main" : designTokens.gray300,
								borderRadius: "8px",
								cursor: "pointer",
								bgcolor: on ? designTokens.primarySoft : "transparent",
								transition: "border-color .14s, background .14s",
								"&:hover": on ? {} : { borderColor: designTokens.gray400 },
							}}
						>
							<Box
								sx={{
									width: 20,
									height: 20,
									flex: "0 0 auto",
									borderRadius: "50%",
									border: "2px solid",
									borderColor: on ? "primary.main" : designTokens.gray300,
									bgcolor: on ? "primary.main" : "transparent",
									color: "#fff",
									display: "grid",
									placeItems: "center",
								}}
							>
								{on && <CheckIcon sx={{ fontSize: 13 }} />}
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{lang.label}</Typography>
								<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}>
									{t(`settings.lang.desc.${lang.code}`)}
								</Typography>
							</Box>
							{on && <CheckIcon sx={{ fontSize: 20, color: "primary.main", flex: "0 0 auto" }} />}
						</Box>
					);
				})}
			</Box>
			<Box
				sx={{
					mt: "16px",
					p: "12px 14px",
					fontSize: 12.5,
					lineHeight: 1.5,
					color: "text.secondary",
					bgcolor: designTokens.gray25,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: "8px",
				}}
			>
				{t("settings.lang.note")}
			</Box>
		</SettingsSectionCard>
	);
};

export default LanguageSection;
