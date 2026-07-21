import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { InviteUserRequest } from "models/settings";
import { designTokens } from "theme";
import { UZ_COUNTRY_PREFIX, uzNationalPart, uzPhoneToStored } from "utils/phoneUtils";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	InputAdornment,
	TextField,
	Typography,
} from "@mui/material";

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
 * Uses the shared modal skeleton (FormDialogHeader + dividered DialogContent); the
 * footer keeps the specialised «Отправить приглашение» action rather than a generic save.
 */
const InviteUserModal: React.FC<Props> = ({ isOpen, saving, onClose, onInvite }) => {
	const { t } = useTranslation();
	// `value` holds the editable national digits; the «+998» prefix is fixed.
	const [value, setValue] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const valid = value.length === 9;
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
			// Send a normalized E.164 number (+998XXXXXXXXX), matching login/register.
			onInvite({ method: "phone", value: uzPhoneToStored(value) });
			reset();
		}
	};
	const onKeyDown = useFormKeyboardSubmit(submit, saving);

	return (
		<Dialog
			open={isOpen}
			onClose={close}
			fullWidth
			maxWidth="sm"
			disableEscapeKeyDown={saving}
			onKeyDown={onKeyDown}
		>
			<FormDialogHeader
				title={t("settings.invite.title")}
				subtitle={t("settings.invite.subtitle")}
				disabled={saving}
				onClose={close}
			/>

			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
						inputMode="numeric"
						placeholder="90 123 45 67"
						onChange={(e) => setValue(uzNationalPart(e.target.value))}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
											{UZ_COUNTRY_PREFIX}
										</Typography>
									</InputAdornment>
								),
							},
						}}
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
			</DialogContent>

			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					gap: "10px",
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
			</DialogActions>
		</Dialog>
	);
};

export default InviteUserModal;
