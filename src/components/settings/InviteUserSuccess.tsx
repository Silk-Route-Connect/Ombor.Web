import React from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { TenantUser } from "models/settings";
import { designTokens, radius } from "theme";
import { formatUzPhone } from "utils/phoneUtils";

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
					borderRadius: `${radius.md}px`,
					bgcolor: designTokens.bgSubtle,
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

			<Callout tone="info">{t("settings.invite.noSms")}</Callout>
		</Stack>
	);
};

export default InviteUserSuccess;
