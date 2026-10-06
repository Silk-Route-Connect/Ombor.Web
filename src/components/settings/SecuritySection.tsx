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
import { settingsFieldSx, settingsFormSx } from "./styles";

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
			icon={<LockOutlinedIcon />}
			title={t("settings.security.title")}
			subtitle={t("settings.security.subtitle")}
			onSubmit={() => void submit()}
			footer={
				<PrimaryButton type="submit" loading={saving} sx={{ ml: "auto", whiteSpace: "nowrap" }}>
					{t("settings.security.submit")}
				</PrimaryButton>
			}
		>
			{/* Each password field reserves its own helper line (caps lock, error) — that line is the gap. */}
			<Box sx={{ ...settingsFormSx, gap: "4px" }}>
				{FIELDS.map(({ name, labelKey, autoComplete }) => (
					<Box key={name} sx={settingsFieldSx}>
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
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{t("settings.security.note")}
				</Typography>
			</Box>
		</SettingsSectionCard>
	);
};

export default SecuritySection;
