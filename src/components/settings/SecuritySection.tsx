import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import PasswordField from "components/shared/PasswordField/PasswordField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useChangePasswordForm } from "hooks/settings/useChangePasswordForm";
import { ChangePasswordRequest } from "models/settings";
import { ChangePasswordFormValues } from "schemas/ChangePasswordSchema";
import { ServerErrorHandler } from "utils/formServerErrors";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

interface Props {
	saving: boolean;
	onChangePassword: (
		request: ChangePasswordRequest,
		applyServerErrors: ServerErrorHandler,
	) => Promise<boolean>;
}

const FIELDS: Array<{
	name: keyof ChangePasswordFormValues;
	labelKey: string;
	autoComplete: string;
}> = [
	{
		name: "currentPassword",
		labelKey: "settings.security.current",
		autoComplete: "current-password",
	},
	{ name: "newPassword", labelKey: "settings.security.new", autoComplete: "new-password" },
	{ name: "confirmPassword", labelKey: "settings.security.confirm", autoComplete: "new-password" },
];

/** Безопасность — change the signed-in user's own password (`PUT /api/settings/password`). */
const SecuritySection: React.FC<Props> = ({ saving, onChangePassword }) => {
	const { t } = useTranslation();
	const { form, submit } = useChangePasswordForm(onChangePassword);
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<SettingsSectionCard
			id="security"
			icon={<LockOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("settings.security.title")}
			subtitle={t("settings.security.subtitle")}
		>
			<Box
				component="form"
				noValidate
				onSubmit={(e: React.FormEvent) => {
					e.preventDefault();
					void submit();
				}}
				sx={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: 380 }}
			>
				{FIELDS.map(({ name, labelKey, autoComplete }) => (
					<Box key={name} sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
						<FormFieldLabel label={t(labelKey)} required htmlFor={`security-${name}`} />
						<Controller
							name={name}
							control={control}
							render={({ field }) => (
								<PasswordField
									id={`security-${name}`}
									label=""
									size="small"
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									inputRef={field.ref}
									autoComplete={autoComplete}
									disabled={saving}
									error={!!errors[name]}
									helperText={errors[name]?.message}
								/>
							)}
						/>
					</Box>
				))}
				<Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
					{t("settings.security.note")}
				</Typography>
				<Box sx={{ mt: "10px" }}>
					<PrimaryButton type="submit" loading={saving}>
						{t("settings.security.submit")}
					</PrimaryButton>
				</Box>
			</Box>
		</SettingsSectionCard>
	);
};

export default SecuritySection;
