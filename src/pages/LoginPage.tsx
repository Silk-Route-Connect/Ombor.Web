import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PatternFormat } from "react-number-format";
import { Link as RouterLink } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordField from "components/shared/PasswordField/PasswordField";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { LoginFormValues, loginSchema } from "schemas/AuthSchema";
import { useStore } from "stores/StoreContext";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import {
	Alert,
	Button,
	Card,
	CardContent,
	Link,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

const LoginPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { authStore, notificationStore } = useStore();
	const [serverError, setServerError] = React.useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { phoneNumber: "", password: "" },
		mode: "onBlur",
	});

	const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
		setServerError(null);
		try {
			await authStore.login({
				phoneNumber: normalizeUzPhoneToE164(values.phoneNumber),
				password: values.password,
			});
		} catch {
			notificationStore.error(t("auth.errors.loginFailed"));
			setServerError(t("auth.errors.loginFailed"));
		}
	};

	// Store the label text in a variable to ensure consistency
	const phoneLabel = t("auth.phoneNumber");

	return (
		<AuthLayout
			titleKey="auth.login"
			subtitleKey="auth.loginSubtitle"
			switchTextKey="auth.goToRegister"
			switchTo="/register"
			hideHeaderSwitch
		>
			<Card sx={{ borderRadius: 3, boxShadow: 0 }}>
				<CardContent sx={{ p: 0 }}>
					<Stack spacing={3} sx={{ p: { xs: 1, md: 1 } }}>
						{serverError ? (
							<Alert severity="error" variant="outlined" sx={{ mx: 0, mt: 0 }}>
								{serverError}
							</Alert>
						) : null}

						<form noValidate onSubmit={handleSubmit(onSubmit)}>
							<Stack spacing={3}>
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
													? t(errors.password.message ?? "auth.errors.required")
													: undefined
											}
											autoComplete="current-password"
										/>
									)}
								/>

								<Button
									fullWidth
									variant="contained"
									size="large"
									type="submit"
									disabled={isSubmitting}
									sx={{ textTransform: "none", py: 1.25, borderRadius: 2 }}
								>
									{isSubmitting ? t("common.loading") : t("auth.login")}
								</Button>

								<Typography variant="body2" color="text.secondary" textAlign="center">
									<Link component={RouterLink} to="/register" underline="hover">
										{t("auth.goToRegister")}
									</Link>
								</Typography>
							</Stack>
						</form>
					</Stack>
				</CardContent>
			</Card>
		</AuthLayout>
	);
});

export default LoginPage;
