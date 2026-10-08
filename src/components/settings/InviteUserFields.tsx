import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import UzPhonePrefix from "components/shared/Inputs/PhoneListField/UzPhonePrefix";
import { InviteUserFormInputs, InviteUserFormValues } from "schemas/InviteUserSchema";
import { designTokens, radius } from "theme";
import { formatUzNational, uzNationalPart } from "utils/phoneUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box, TextField } from "@mui/material";

import { settingsFieldSx } from "./styles";

interface InviteUserFieldsProps {
	form: UseFormReturn<InviteUserFormInputs, unknown, InviteUserFormValues>;
	disabled: boolean;
}

/** Имя · Фамилия (optional) · phone, and the locked «Администратор» role. */
const InviteUserFields: React.FC<InviteUserFieldsProps> = ({ form, disabled }) => {
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<>
			<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "12px" }}>
				<Box sx={settingsFieldSx}>
					<FormFieldLabel label={t("settings.invite.firstName")} required htmlFor="invite-first" />
					<TextField
						id="invite-first"
						size="small"
						fullWidth
						autoFocus
						disabled={disabled}
						placeholder={t("auth.field.firstNamePlaceholder")}
						error={!!errors.firstName}
						helperText={errors.firstName?.message}
						{...register("firstName")}
					/>
				</Box>
				<Box sx={settingsFieldSx}>
					<FormFieldLabel
						label={t("settings.invite.lastName")}
						hint={t("common.optional")}
						htmlFor="invite-last"
					/>
					<TextField
						id="invite-last"
						size="small"
						fullWidth
						disabled={disabled}
						placeholder={t("auth.field.lastNamePlaceholder")}
						error={!!errors.lastName}
						helperText={errors.lastName?.message}
						{...register("lastName")}
					/>
				</Box>
			</Box>

			<Box sx={settingsFieldSx}>
				<FormFieldLabel label={t("settings.invite.phone")} required htmlFor="invite-phone" />
				<Controller
					name="phone"
					control={control}
					render={({ field }) => (
						<TextField
							id="invite-phone"
							type="tel"
							size="small"
							fullWidth
							disabled={disabled}
							inputRef={field.ref}
							value={formatUzNational(field.value)}
							onChange={(e) => field.onChange(uzNationalPart(e.target.value))}
							onBlur={field.onBlur}
							placeholder={t("auth.field.phonePlaceholder")}
							error={!!errors.phone}
							helperText={errors.phone?.message ?? t("settings.invite.phoneHint")}
							slotProps={{
								input: {
									inputMode: "numeric",
									startAdornment: <UzPhonePrefix />,
								},
							}}
						/>
					)}
				/>
			</Box>

			<Box sx={settingsFieldSx}>
				<FormFieldLabel label={t("settings.invite.role")} />
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
						p: "10px 13px",
						minHeight: 40,
						border: "1px dashed",
						borderColor: designTokens.borderStrong,
						borderRadius: `${radius.md}px`,
						bgcolor: designTokens.bgSubtle,
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
							fontSize: 12,
							fontWeight: 600,
							color: "text.secondary",
						}}
					>
						<InfoOutlinedIcon sx={{ fontSize: 14 }} />
						{t("settings.invite.rolesLater")}
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default InviteUserFields;
