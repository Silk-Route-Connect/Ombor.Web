import React from "react";
import { useTranslation } from "react-i18next";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { TenantUser } from "models/settings";
import { designTokens } from "theme";
import { formatUzPhone } from "utils/phoneUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, DialogActions, DialogContent, Typography } from "@mui/material";

interface InviteUserSuccessProps {
	user: TenantUser;
	onDone: () => void;
}

/**
 * After an invite: who was added and how they sign in. No invite SMS exists
 * (settings.md → invite), so the owner has to pass the steps on themselves.
 */
const InviteUserSuccess: React.FC<InviteUserSuccessProps> = ({ user, onDone }) => {
	const { t } = useTranslation();

	return (
		<>
			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
			</DialogContent>

			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<PrimaryButton autoFocus onClick={onDone}>
					{t("settings.invite.done")}
				</PrimaryButton>
			</DialogActions>
		</>
	);
};

export default InviteUserSuccess;
