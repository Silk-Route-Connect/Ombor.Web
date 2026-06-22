import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { InviteUserRequest } from "models/settings";
import { designTokens } from "theme";

import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Box, Dialog, IconButton, TextField, Typography } from "@mui/material";

interface Props {
	isOpen: boolean;
	saving: boolean;
	onClose: () => void;
	onInvite: (request: InviteUserRequest) => void;
}

/**
 * Invite-user modal — phone only in v1 (login is phone-based; the backend rejects
 * email invites). On-submit inline validation; the send button is never disabled
 * (hard rule 5). Role is a locked «Администратор» (roles are not split in MVP).
 */
const InviteUserModal: React.FC<Props> = ({ isOpen, saving, onClose, onInvite }) => {
	const { t } = useTranslation();
	const [value, setValue] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const trimmed = value.trim();
	const valid = trimmed.replace(/\D/g, "").length >= 9;
	const showError = submitted && !valid;

	const reset = (): void => {
		setValue("");
		setSubmitted(false);
	};
	const close = (): void => {
		reset();
		onClose();
	};
	const submit = (): void => {
		setSubmitted(true);
		if (valid) {
			onInvite({ method: "phone", value: trimmed });
			reset();
		}
	};

	return (
		<Dialog
			open={isOpen}
			onClose={close}
			slotProps={{ paper: { sx: { width: 480, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					p: "20px 24px 0",
				}}
			>
				<Box>
					<Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
						{t("settings.invite.title")}
					</Typography>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}>
						{t("settings.invite.subtitle")}
					</Typography>
				</Box>
				<IconButton onClick={close} sx={{ color: "text.secondary", mt: "-4px", mr: "-8px" }}>
					<CloseIcon sx={{ fontSize: 20 }} />
				</IconButton>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", p: "20px 24px" }}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
					<Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.gray700 }}>
						{t("settings.invite.phone")}
						<Box component="span" sx={{ color: "error.main" }}>
							{" *"}
						</Box>
					</Typography>
					<TextField
						size="small"
						fullWidth
						autoFocus
						error={showError}
						value={value}
						inputMode="tel"
						placeholder="+998 90 123 45 67"
						onChange={(e) => setValue(e.target.value)}
						sx={{ "& .MuiInputBase-root": { fontSize: 14 } }}
					/>
					{showError && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "5px",
								fontSize: 12,
								color: "error.main",
							}}
						>
							<ErrorOutlineIcon sx={{ fontSize: 13 }} />
							{t("settings.invite.errorPhone")}
						</Box>
					)}
				</Box>

				<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
					<Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.gray700 }}>
						{t("settings.invite.role")}
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							p: "10px 13px",
							minHeight: 40,
							border: "1px dashed",
							borderColor: designTokens.gray300,
							borderRadius: "8px",
							bgcolor: designTokens.gray25,
							fontSize: 14,
							color: "text.secondary",
						}}
					>
						<PersonOutlineIcon sx={{ fontSize: 16, color: "text.disabled" }} />
						<Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
							{t("settings.users.admin")}
						</Box>
						<Box
							component="span"
							sx={{
								ml: "auto",
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								fontSize: 11,
								fontWeight: 600,
								color: "text.disabled",
							}}
						>
							<InfoOutlinedIcon sx={{ fontSize: 13 }} />
							{t("settings.invite.rolesLater")}
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					gap: "10px",
					p: "14px 24px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<GhostButton onClick={close} disabled={saving}>
					{t("common.cancel")}
				</GhostButton>
				<PrimaryButton
					icon={<SendOutlinedIcon sx={{ fontSize: "17px !important" }} />}
					disabled={saving}
					onClick={submit}
				>
					{t("settings.invite.send")}
				</PrimaryButton>
			</Box>
		</Dialog>
	);
};

export default InviteUserModal;
