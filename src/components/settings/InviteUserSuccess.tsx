import React from "react";
import { useTranslation } from "react-i18next";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { TenantUser } from "models/settings";
import { designTokens } from "theme";
import { formatUzPhone } from "utils/phoneUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Stack, Typography } from "@mui/material";

interface InviteUserSuccessProps {
	user: TenantUser;
}

/**
 * After an invite: who was added and how they sign in. No invite SMS exists
 * (settings.md → invite), so the owner has to pass the steps on themselves.
 * The modal's footer closes it («Готово»).
 */
const InviteUserSuccess: React.FC<InviteUserSuccessProps> = ({ user }) => {
	const { t } = useTranslation();

	return (
		<Stack sx={{ gap: "16px" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					p: "12px 14px",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: "8px",
					bgcolor: designTokens.gray25,
				}}
			>
				<EntityAvatar name={user.name} size={38} />
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{user.name}</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
						{formatUzPhone(user.contact)}
					</Typography>
				</Box>
			</Box>

			<Box>
				<Typography sx={{ fontSize: 14, fontWeight: 600, mb: "6px" }}>
					{t("settings.invite.howToSignIn")}
				</Typography>
				<Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>
					{t("settings.invite.signInSteps")}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					gap: "8px",
					p: "10px 12px",
					borderRadius: "8px",
					border: "1px solid",
					borderColor: designTokens.infoBorder,
					bgcolor: designTokens.infoBg,
					color: "info.dark",
					fontSize: 13,
					lineHeight: 1.45,
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 16, mt: "1px", flex: "0 0 auto" }} />
				{t("settings.invite.noSms")}
			</Box>
		</Stack>
	);
};

export default InviteUserSuccess;
