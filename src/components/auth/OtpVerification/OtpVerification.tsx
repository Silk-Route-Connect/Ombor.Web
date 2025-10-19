import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OtpInput from "components/auth/OtpInput/OtpInput";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { RegisterRequest } from "models/auth";
import { OtpFormValues, otpSchema } from "schemas/AuthSchema";
import { authApi } from "services/api/AuthApi";
import { useStore } from "stores/StoreContext";

import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

interface OtpVerificationProps {
	phoneNumber: string;
	registrationData: RegisterRequest;
	onSuccess: () => void;
	onBack: () => void;
}

const RESEND_SECONDS = 60;

const OtpVerification: React.FC<OtpVerificationProps> = observer(
	({ phoneNumber, registrationData, onSuccess, onBack }) => {
		const { authStore, notificationStore } = useStore();
		const [resendIn, setResendIn] = React.useState<number>(RESEND_SECONDS);
		const [isVerifying, setIsVerifying] = React.useState(false);
		const [isResending, setIsResending] = React.useState(false);
		const timerRef = React.useRef<number | null>(null);

		const {
			control,
			handleSubmit,
			formState: { errors },
			watch,
		} = useForm<OtpFormValues>({
			resolver: zodResolver(otpSchema),
			defaultValues: { code: "" },
			mode: "onChange",
		});

		const code = watch("code");

		React.useEffect(() => {
			startTimer();
			return () => {
				if (timerRef.current) {
					window.clearInterval(timerRef.current);
				}
			};
		}, []);

		const startTimer = () => {
			setResendIn(RESEND_SECONDS);
			if (timerRef.current) {
				window.clearInterval(timerRef.current);
			}
			timerRef.current = window.setInterval(() => {
				setResendIn((prev) => {
					if (prev <= 1) {
						if (timerRef.current) {
							window.clearInterval(timerRef.current);
							timerRef.current = null;
						}
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		};

		const onSubmit: SubmitHandler<OtpFormValues> = async (values) => {
			if (isVerifying) return;

			setIsVerifying(true);
			try {
				await authStore.verifyPhone({
					phoneNumber,
					code: values.code,
				});
				notificationStore.success(translate("auth.registrationComplete"));
				onSuccess();
			} catch (error) {
				notificationStore.error(translate("auth.errors.otpInvalid"));
			} finally {
				setIsVerifying(false);
			}
		};

		const handleResend = async () => {
			if (resendIn > 0 || isResending) return;

			setIsResending(true);
			try {
				// Use dedicated resend endpoint if available
				const response = await authApi.register({ ...registrationData, phoneNumber });

				const minutes = response.expiresInMinutes || 5;
				notificationStore.success(
					translate("auth.otpSent").replace("{{minutes}}", String(minutes)),
				);
				startTimer();
			} catch (error) {
				notificationStore.error(translate("auth.errors.resendFailed"));
			} finally {
				setIsResending(false);
			}
		};

		const canSubmit = code.length === 4 && !isVerifying;

		return (
			<Card sx={{ borderRadius: 3, boxShadow: 0 }}>
				<CardContent sx={{ p: 0 }}>
					<Stack spacing={3} sx={{ p: { xs: 2.5, md: 4 } }}>
						<Typography variant="body2" color="text.secondary">
							{translate("auth.verifySubtitle").replace("{{phone}}", phoneNumber)}
						</Typography>

						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<OtpInput
									value={field.value}
									onChange={field.onChange}
									autoFocus
									disabled={isVerifying}
									errorText={
										errors.code
											? translate(errors.code.message ?? "auth.errors.otpInvalid")
											: undefined
									}
								/>
							)}
						/>

						<Stack direction="row" spacing={2}>
							<Button
								variant="contained"
								onClick={handleSubmit(onSubmit)}
								disabled={!canSubmit}
								fullWidth
							>
								{isVerifying ? translate("common.loading") : translate("auth.verify")}
							</Button>

							<Button
								variant="outlined"
								onClick={handleResend}
								disabled={resendIn > 0 || isResending}
								fullWidth
							>
								{resendIn > 0
									? translate("auth.resendIn").replace("{{seconds}}", String(resendIn))
									: translate("auth.resend")}
							</Button>
						</Stack>

						<Button variant="text" onClick={onBack} sx={{ textTransform: "none" }}>
							{translate("auth.changePhone")}
						</Button>
					</Stack>
				</CardContent>
			</Card>
		);
	},
);

export default OtpVerification;
