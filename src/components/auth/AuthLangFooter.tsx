import React from "react";
import { useTranslation } from "react-i18next";
import { UI_LANGUAGES } from "i18n/languages";
import { designTokens } from "theme";

import { Box, ButtonBase } from "@mui/material";

/**
 * Interface-language switch at the foot of the auth card. Wired to the same
 * shared `UI_LANGUAGES` list + i18n the Topbar globe uses (changeLanguage
 * persists to localStorage). The design drew three languages; uz-Cyrl stays
 * gated out of `UI_LANGUAGES` until its resources land.
 */
const AuthLangFooter: React.FC = () => {
	const { i18n } = useTranslation();
	const current = i18n.language;

	return (
		<Box
			sx={{
				mt: "24px",
				pt: "16px",
				borderTop: "1px solid",
				borderColor: "divider",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "4px",
				fontSize: 12.5,
			}}
		>
			{UI_LANGUAGES.map((lang, i) => {
				const active = current === lang.code || current.startsWith(`${lang.code}-`);
				return (
					<React.Fragment key={lang.code}>
						{i > 0 && (
							<Box component="span" sx={{ color: designTokens.gray300 }}>
								·
							</Box>
						)}
						<ButtonBase
							onClick={() => void i18n.changeLanguage(lang.code)}
							sx={{
								px: "6px",
								py: "2px",
								borderRadius: "4px",
								fontSize: 12.5,
								fontWeight: active ? 700 : 400,
								color: active ? "primary.main" : "text.disabled",
								"&:hover": { color: active ? "primary.main" : "text.secondary" },
							}}
						>
							{lang.label}
						</ButtonBase>
					</React.Fragment>
				);
			})}
		</Box>
	);
};

export default AuthLangFooter;
