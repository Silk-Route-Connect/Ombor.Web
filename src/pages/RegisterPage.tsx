import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { Link as RouterLink } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import OtpInput from "components/auth/OtpInput/OtpInput";
import PasswordField from "components/shared/PasswordField/PasswordField";
import { translate } from "i18n/i18n";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { OtpFormValues, otpSchema, RegisterFormValues, registerSchema } from "schemas/AuthSchema";
import { authApi } from "services/api/AuthApi";
import { useStore } from "stores/StoreContext";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import {
	Box,
	Button,
	Card,
	CardContent,
	Grid,
	Link,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

type Step = "form" | "otp";

const RESEND_SECONDS = 60;

const RegisterPage: React.FC = observer(() => {
	const { authStore, notificationStore } = useStore();

	const [step, setStep] = React.useState<Step>("form");
	const [phoneForOtp, setPhoneForOtp] = React.useState<string>("");
	const [resendIn, setResendIn] = React.useState<number>(RESEND_SECONDS);
	const timerRef = React.useRef<number | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		getValues,
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

	const {
		control: otpControl,
		handleSubmit: handleOtpSubmit,
		setValue: setOtpValue,
		formState: { errors: otpErrors, isSubmitting: isVerifying },
		watch: otpWatch,
	} = useForm<OtpFormValues>({
		resolver: zodResolver(otpSchema),
		defaultValues: { code: "" },
		mode: "onChange",
	});

	React.useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearInterval(timerRef.current);
			}
		};
	}, []);

	const startResendTimer = React.useCallback(() => {
		setResendIn(RESEND_SECONDS);
		if (timerRef.current !== null) {
			window.clearInterval(timerRef.current);
		}
		timerRef.current = window.setInterval(() => {
			setResendIn((s) => {
				if (s <= 1) {
					if (timerRef.current !== null) {
						window.clearInterval(timerRef.current);
						timerRef.current = null;
					}
					return 0;
				}
				return s - 1;
			});
		}, 1000);
	}, []);

	const onSubmitRegister: SubmitHandler<RegisterFormValues> = async (values) => {
		const normalizedPhone = normalizeUzPhoneToE164(values.phoneNumber);
		try {
			const res = await authApi.register({
				...values,
				phoneNumber: normalizedPhone,
				email: values.email || undefined,
				telegramAccount: values.telegramAccount || undefined,
			});

			setPhoneForOtp(normalizedPhone);
			setStep("otp");
			setOtpValue("code", "");
			startResendTimer();

			notificationStore.success(translate("auth.otpSent", { minutes: res.expiresInMinutes }));
		} catch {
			notificationStore.error(translate("auth.errors.registrationFailed"));
		}
	};

	const onResend = async () => {
		if (resendIn > 0) return;

		const values = getValues();
		const normalizedPhone = normalizeUzPhoneToE164(values.phoneNumber);

		try {
			const res = await authApi.register({
				...values,
				phoneNumber: normalizedPhone,
				email: values.email || undefined,
				telegramAccount: values.telegramAccount || undefined,
			});

			startResendTimer();
			notificationStore.success(translate("auth.otpSent", { minutes: res.expiresInMinutes }));
		} catch {
			notificationStore.error(translate("auth.errors.registrationFailed"));
		}
	};

	const onSubmitOtp: SubmitHandler<OtpFormValues> = async (values) => {
		try {
			await authStore.verifyPhone({
				phoneNumber: phoneForOtp,
				code: values.code,
			});
			notificationStore.success(translate("auth.registrationComplete"));
		} catch {
			notificationStore.error(translate("auth.errors.otpInvalid"));
		}
	};

	if (step === "otp") {
		const code = otpWatch("code");

		React.useEffect(() => {
			if (code.length === 4 && !isVerifying) {
				void handleOtpSubmit(onSubmitOtp)();
			}
		}, [code, isVerifying, handleOtpSubmit]);

		return (
			<AuthLayout
				titleKey="auth.verify"
				subtitleKey="auth.verifySubtitle"
				switchTextKey="auth.goToLogin"
				switchTo="/login"
				rightMaxWidth={480}
				hideHeaderSwitch
			>
				<Card sx={{ borderRadius: 3, boxShadow: 0 }}>
					<CardContent sx={{ p: 0 }}>
						<Stack spacing={3} sx={{ p: { xs: 2.5, md: 4 } }}>
							<Typography variant="body2" color="text.secondary">
								{translate("auth.verifySubtitle", { phone: phoneForOtp })}
							</Typography>

							<Controller
								name="code"
								control={otpControl}
								render={({ field }) => (
									<OtpInput
										value={field.value}
										onChange={(v) => field.onChange(v)}
										disabled={isVerifying}
										errorText={
											otpErrors.code
												? translate(otpErrors.code.message ?? "auth.errors.otpInvalid")
												: undefined
										}
									/>
								)}
							/>

							<Stack direction="row" spacing={2}>
								<Button
									variant="contained"
									onClick={handleOtpSubmit(onSubmitOtp)}
									disabled={isVerifying || code.length !== 4}
								>
									{isVerifying ? translate("common.loading") : translate("auth.verify")}
								</Button>

								<Button variant="text" onClick={onResend} disabled={resendIn > 0 || isVerifying}>
									{resendIn > 0
										? translate("auth.resendIn", { seconds: resendIn })
										: translate("auth.resend")}
								</Button>
							</Stack>

							<Typography variant="body2" color="text.secondary" textAlign="center">
								<Link component={RouterLink} to="/register" underline="hover">
									{translate("auth.changePhone")}
								</Link>
							</Typography>
						</Stack>
					</CardContent>
				</Card>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			titleKey="auth.register"
			subtitleKey="auth.registerSubtitle"
			switchTextKey="auth.goToLogin"
			switchTo="/login"
			rightMaxWidth={720}
			hideHeaderSwitch
		>
			<Card sx={{ borderRadius: 3, boxShadow: 0 }}>
				<CardContent sx={{ p: 0 }}>
					<Stack spacing={3} sx={{ p: { xs: 1, md: 1 } }}>
						<Box component="form" noValidate onSubmit={handleSubmit(onSubmitRegister)}>
							<Grid container spacing={2}>
								<Grid size={{ xs: 12, md: 6 }}>
									<Controller
										name="firstName"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label={translate("auth.firstName")}
												fullWidth
												autoComplete="given-name"
												error={Boolean(errors.firstName)}
												helperText={
													errors.firstName
														? translate(errors.firstName.message ?? "auth.errors.required")
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
												label={translate("auth.lastName")}
												fullWidth
												autoComplete="family-name"
												error={Boolean(errors.lastName)}
												helperText={
													errors.lastName
														? translate(errors.lastName.message ?? "auth.errors.required")
														: " "
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
												label={translate("auth.phoneNumber")}
												fullWidth
												slotProps={{
													input: { inputMode: "tel", autoComplete: "tel" },
												}}
												error={Boolean(errors.phoneNumber)}
												helperText={
													errors.phoneNumber
														? translate(errors.phoneNumber.message ?? "auth.errors.invalidPhone")
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
												label={translate("auth.organizationName")}
												fullWidth
												autoComplete="organization"
												error={Boolean(errors.organizationName)}
												helperText={
													errors.organizationName
														? translate(errors.organizationName.message ?? "auth.errors.required")
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
												label={translate("auth.email")}
												type="email"
												fullWidth
												autoComplete="email"
												error={Boolean(errors.email)}
												helperText={
													errors.email
														? translate(errors.email.message ?? "auth.errors.invalidEmail")
														: " "
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
												label={translate("auth.telegramAccount")}
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
												label={translate("auth.password")}
												value={field.value}
												onChange={(v) => field.onChange(v)}
												error={Boolean(errors.password)}
												helperText={
													errors.password
														? translate(errors.password.message ?? "auth.errors.passwordMin")
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
												label={translate("auth.confirmPassword")}
												value={field.value}
												onChange={(v) => field.onChange(v)}
												error={Boolean(errors.confirmPassword)}
												helperText={
													errors.confirmPassword
														? translate(
																errors.confirmPassword.message ?? "auth.errors.passwordMismatch",
															)
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
										{isSubmitting ? translate("common.loading") : translate("auth.register")}
									</Button>
								</Grid>

								<Grid size={{ xs: 12 }}>
									<Typography variant="body2" color="text.secondary" textAlign="center">
										<Link component={RouterLink} to="/login" underline="hover">
											{translate("auth.goToLogin")}
										</Link>
									</Typography>
								</Grid>
							</Grid>
						</Box>
					</Stack>
				</CardContent>
			</Card>
		</AuthLayout>
	);
});

export default RegisterPage;
