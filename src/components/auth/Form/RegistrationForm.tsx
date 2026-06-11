// ===================================
// components/RegistrationForm.tsx
// ===================================
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PatternFormat } from "react-number-format";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordField from "components/shared/PasswordField/PasswordField";
import { observer } from "mobx-react-lite";
import { RegisterFormValues, registerSchema } from "schemas/AuthSchema";
import { authApi } from "services/api/AuthApi";
import { useStore } from "stores/StoreContext";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import { Box, Button, Card, CardContent, Grid, Stack, TextField } from "@mui/material";

interface RegistrationFormProps {
	onSuccess: (phoneNumber: string, data: any) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = observer(({ onSuccess }) => {
	const { t } = useTranslation();
	const { notificationStore } = useStore();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phoneNumber: "",
			organizationName: "",
			email: "",
			telegramAccount: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onBlur",
	});

	const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		const normalizedPhone = normalizeUzPhoneToE164(values.phoneNumber);

		try {
			const response = await authApi.register({
				...values,
				phoneNumber: normalizedPhone,
				email: values.email || undefined,
				telegramAccount: values.telegramAccount || undefined,
			});

			const minutes = response.expiresInMinutes || 5;
			notificationStore.success(t("auth.otpSent").replace("{{minutes}}", String(minutes)));

			onSuccess(normalizedPhone, values);
		} catch (error) {
			notificationStore.error(t("auth.errors.registrationFailed"));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card sx={{ borderRadius: 3, boxShadow: 0 }}>
			<CardContent sx={{ p: 0 }}>
				<Stack spacing={3} sx={{ p: { xs: 2.5, md: 4 } }}>
					<Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="firstName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label={t("auth.firstName")}
											fullWidth
											autoComplete="given-name"
											error={Boolean(errors.firstName)}
											helperText={
												errors.firstName
													? t(errors.firstName.message ?? "auth.errors.required")
													: " "
											}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="lastName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label={t("auth.lastName")}
											fullWidth
											autoComplete="family-name"
											error={Boolean(errors.lastName)}
											helperText={
												errors.lastName ? t(errors.lastName.message ?? "auth.errors.required") : " "
											}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="phoneNumber"
									control={control}
									render={({ field }) => (
										<PatternFormat
											{...field}
											customInput={TextField}
											format="+998 ## ### ## ##"
											mask="_"
											allowEmptyFormatting
											label={t("auth.phoneNumber")}
											fullWidth
											slotProps={{
												input: { inputMode: "tel", autoComplete: "tel" },
											}}
											error={Boolean(errors.phoneNumber)}
											helperText={
												errors.phoneNumber
													? t(errors.phoneNumber.message ?? "auth.errors.invalidPhone")
													: " "
											}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="organizationName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label={t("auth.organizationName")}
											fullWidth
											autoComplete="organization"
											error={Boolean(errors.organizationName)}
											helperText={
												errors.organizationName
													? t(errors.organizationName.message ?? "auth.errors.required")
													: " "
											}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="email"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label={t("auth.email")}
											type="email"
											fullWidth
											autoComplete="email"
											error={Boolean(errors.email)}
											helperText={
												errors.email ? t(errors.email.message ?? "auth.errors.invalidEmail") : " "
											}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
								<Controller
									name="telegramAccount"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label={t("auth.telegramAccount")}
											fullWidth
											autoComplete="nickname"
											helperText=" "
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Controller
									name="password"
									control={control}
									render={({ field }) => (
										<PasswordField
											label={t("auth.password")}
											value={field.value}
											onChange={(v) => field.onChange(v)}
											error={Boolean(errors.password)}
											helperText={
												errors.password
													? t(errors.password.message ?? "auth.errors.passwordMin")
													: undefined
											}
											autoComplete="new-password"
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Controller
									name="confirmPassword"
									control={control}
									render={({ field }) => (
										<PasswordField
											label={t("auth.confirmPassword")}
											value={field.value}
											onChange={(v) => field.onChange(v)}
											error={Boolean(errors.confirmPassword)}
											helperText={
												errors.confirmPassword
													? t(errors.confirmPassword.message ?? "auth.errors.passwordMismatch")
													: undefined
											}
											autoComplete="new-password"
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Button
									variant="contained"
									type="submit"
									disabled={isSubmitting}
									fullWidth
									sx={{ textTransform: "none", py: 1.25, borderRadius: 2 }}
								>
									{isSubmitting ? t("common.loading") : t("auth.register")}
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
});

export default RegistrationForm;
