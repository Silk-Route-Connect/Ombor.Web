import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthBackLink, AuthHead, AuthLink, AuthSuccessBadge } from "components/auth/AuthChrome";
import {
	AuthCodeInput,
	AuthDemoHint,
	AuthPasswordField,
	AuthPhoneField,
} from "components/auth/AuthFields";
import { useCountdown } from "hooks/auth/useCountdown";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import {
	confirmError,
	maskedPhone,
	passwordError,
	phoneError as phoneErrorOf,
} from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import { Box, Button, Typography } from "@mui/material";

type Step = "phone" | "code" | "newpass" | "success";
const RESEND_SECONDS = 60;
const CODE_LENGTH = 4;

const ResetPasswordPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { authStore, notificationStore } = useStore();

	const [step, setStep] = useState<Step>("phone");
	const [phone, setPhone] = useState("");
	const [e164, setE164] = useState("");
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const { seconds, start } = useCountdown(RESEND_SECONDS);

	const resetTried = () => setTried(false);

	/* ── step: phone ── */
	const sendCode = async () => {
		setTried(true);
		if (phoneErrorOf(phone)) {
			return;
		}
		const phoneE164 = normalizeUzPhoneToE164(phone);
		setBusy(true);
		try {
			await authStore.requestPasswordReset({ phoneNumber: phoneE164 });
			setE164(phoneE164);
			setCode("");
			resetTried();
			setStep("code");
			start(RESEND_SECONDS);
			notificationStore.success(t("auth.reset.sent", { phone: maskedPhone(phone) }));
		} catch {
			notificationStore.error(t("auth.reset.failed"));
		} finally {
			setBusy(false);
		}
	};

	/* ── step: code ── */
	const verifyCode = async () => {
		setTried(true);
		if (code.length < CODE_LENGTH) {
			return;
		}
		setBusy(true);
		try {
			await authStore.verifyResetCode({ phoneNumber: e164, code });
			resetTried();
			setStep("newpass");
		} catch {
			setCode("");
			setTried(true);
		} finally {
			setBusy(false);
		}
	};

	const resend = async () => {
		if (seconds > 0 || busy) {
			return;
		}
		setBusy(true);
		try {
			await authStore.requestPasswordReset({ phoneNumber: e164 });
			start(RESEND_SECONDS);
			notificationStore.success(t("auth.reset.sent", { phone: maskedPhone(phone) }));
		} catch {
			notificationStore.error(t("auth.reset.failed"));
		} finally {
			setBusy(false);
		}
	};

	/* ── step: newpass ── */
	const changePassword = async () => {
		setTried(true);
		if (passwordError(password) || confirmError(password, confirm)) {
			return;
		}
		setBusy(true);
		try {
			await authStore.resetPassword({
				phoneNumber: e164,
				code,
				newPassword: password,
				confirmPassword: confirm,
			});
			setStep("success");
		} catch {
			notificationStore.error(t("auth.reset.changeFailed"));
		} finally {
			setBusy(false);
		}
	};

	if (step === "code") {
		const codeErr =
			tried && code.length < CODE_LENGTH ? t("auth.errors.codeIncomplete") : undefined;
		return (
			<AuthLayout>
				<AuthHead
					title={t("auth.reset.codeTitle")}
					subtitle={t("auth.reset.codeSubtitle", { phone: maskedPhone(phone) })}
				/>
				<AuthCodeInput
					value={code}
					onChange={setCode}
					length={CODE_LENGTH}
					autoFocus
					error={codeErr}
				/>
				<Typography sx={{ textAlign: "center", fontSize: 13, color: "text.secondary", mt: "14px" }}>
					{t("auth.otp.resendPrompt")}{" "}
					{seconds > 0 ? (
						<Box component="span" sx={{ color: "text.disabled" }}>
							{t("auth.otp.resendIn", { seconds })}
						</Box>
					) : (
						<AuthLink onClick={() => void resend()}>{t("auth.otp.resend")}</AuthLink>
					)}
				</Typography>
				<Box sx={{ mt: "18px" }}>
					<AuthDemoHint>
						{t("auth.reset.demoCode")} <b>1234</b>
					</AuthDemoHint>
				</Box>
				<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
					<Button
						variant="contained"
						fullWidth
						disabled={busy}
						onClick={() => void verifyCode()}
						sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
					>
						{t("auth.reset.codeSubmit")}
					</Button>
					<AuthBackLink
						onClick={() => {
							setCode("");
							resetTried();
							setStep("phone");
						}}
					>
						{t("auth.reset.changePhone")}
					</AuthBackLink>
				</Box>
			</AuthLayout>
		);
	}

	if (step === "newpass") {
		return (
			<AuthLayout>
				<AuthHead title={t("auth.reset.newTitle")} subtitle={t("auth.reset.newSubtitle")} />
				<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
					<AuthPasswordField
						label={t("auth.field.newPassword")}
						value={password}
						autoFocus
						placeholder={t("auth.field.passwordMin")}
						autoComplete="new-password"
						error={tried && passwordError(password) ? t(passwordError(password)!) : undefined}
						onChange={setPassword}
					/>
					<AuthPasswordField
						label={t("auth.field.confirmPassword")}
						value={confirm}
						placeholder={t("auth.field.confirmPlaceholder")}
						autoComplete="new-password"
						error={
							tried && confirmError(password, confirm)
								? t(confirmError(password, confirm)!)
								: undefined
						}
						onChange={setConfirm}
						onEnter={() => void changePassword()}
					/>
				</Box>
				<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
					<Button
						variant="contained"
						fullWidth
						disabled={busy}
						onClick={() => void changePassword()}
						sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
					>
						{t("auth.reset.changeSubmit")}
					</Button>
					<AuthBackLink onClick={() => navigate(PATHS.login)}>
						{t("auth.reset.backToLogin")}
					</AuthBackLink>
				</Box>
			</AuthLayout>
		);
	}

	if (step === "success") {
		return (
			<AuthLayout>
				<Box sx={{ textAlign: "center" }}>
					<AuthSuccessBadge />
					<Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
						{t("auth.reset.successTitle")}
					</Typography>
					<Typography sx={{ fontSize: 14, color: "text.secondary", mt: "6px" }}>
						{t("auth.reset.successSubtitle")}
					</Typography>
				</Box>
				<Box sx={{ mt: "26px" }}>
					<Button
						variant="contained"
						fullWidth
						onClick={() => navigate(PATHS.login)}
						sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
					>
						{t("auth.reset.successLogin")}
					</Button>
				</Box>
			</AuthLayout>
		);
	}

	// step === "phone"
	return (
		<AuthLayout>
			<AuthHead title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")} />
			<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<AuthPhoneField
					label={t("auth.field.phone")}
					value={phone}
					autoFocus
					error={tried && phoneErrorOf(phone) ? t(phoneErrorOf(phone)!) : undefined}
					onChange={setPhone}
					onEnter={() => void sendCode()}
				/>
			</Box>
			<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
				<Button
					variant="contained"
					fullWidth
					disabled={busy}
					onClick={() => void sendCode()}
					sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
				>
					{t("auth.reset.sendCode")}
				</Button>
				<AuthBackLink onClick={() => navigate(PATHS.login)}>
					{t("auth.reset.backToLogin")}
				</AuthBackLink>
			</Box>
		</AuthLayout>
	);
});

export default ResetPasswordPage;
