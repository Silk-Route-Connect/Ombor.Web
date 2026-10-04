import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthBackLink, AuthHead, AuthSuccessBadge } from "components/auth/AuthChrome";
import AuthCodeStep from "components/auth/AuthCodeStep";
import { AuthBanner } from "components/auth/AuthFields/AuthBanner";
import { AuthPasswordField } from "components/auth/AuthFields/AuthPasswordField";
import { AuthPhoneField } from "components/auth/AuthFields/AuthPhoneField";
import { useCodeChallenge } from "hooks/auth/useCodeChallenge";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { LoginPrefill } from "routing/navigationState";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { describeApiReason } from "utils/apiError";
import { isCodeRefused } from "utils/authErrors";
import {
	confirmError,
	maskedPhone,
	passwordError,
	phoneError as phoneErrorOf,
} from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import { Box, Button, Typography } from "@mui/material";

type Step = "phone" | "code" | "newpass" | "success";

const submitSx = { height: 46, fontSize: 15, borderRadius: "10px" } as const;

/**
 * «Забыли пароль или входите впервые?» — phone → SMS code → new password. It is
 * also how an invited colleague signs in the first time: the code proves the
 * phone and the password they set here becomes their login (settings.md → invite).
 */
const ResetPasswordPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { authStore, notificationStore } = useStore();
	const challenge = useCodeChallenge();

	const [step, setStep] = useState<Step>("phone");
	const [phone, setPhone] = useState("");
	const [e164, setE164] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [tried, setTried] = useState(false);
	const [banner, setBanner] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [resending, setResending] = useState(false);

	const goTo = (next: Step) => {
		setTried(false);
		setBanner(null);
		setStep(next);
	};

	const sendCode = async () => {
		setTried(true);
		setBanner(null);
		if (busy || phoneErrorOf(phone)) {
			return;
		}
		const phoneE164 = normalizeUzPhoneToE164(phone);
		setBusy(true);
		try {
			challenge.issue(await authStore.requestPasswordReset({ phoneNumber: phoneE164 }));
			setE164(phoneE164);
			goTo("code");
		} catch (e) {
			setBanner(describeApiReason(e, "auth.reset.failed"));
		} finally {
			setBusy(false);
		}
	};

	const verifyCode = async () => {
		if (busy || !challenge.readyToSend()) {
			return;
		}
		setBusy(true);
		try {
			await authStore.verifyResetCode({ phoneNumber: e164, code: challenge.code });
			goTo("newpass");
		} catch (e) {
			challenge.refuse(e);
		} finally {
			setBusy(false);
		}
	};

	const resend = async () => {
		if (resending) {
			return;
		}
		setResending(true);
		try {
			challenge.issue(await authStore.requestPasswordReset({ phoneNumber: e164 }));
			// Same answer for an unknown number, so no «отправлен» claim (see codeSubtitle).
			notificationStore.info(t("auth.reset.resent"));
		} catch (e) {
			challenge.holdResend(e);
			notificationStore.error(describeApiReason(e, "auth.reset.failed"));
		} finally {
			setResending(false);
		}
	};

	const savePassword = async () => {
		setTried(true);
		setBanner(null);
		if (busy || passwordError(password) || confirmError(password, confirm)) {
			return;
		}
		setBusy(true);
		try {
			await authStore.resetPassword({
				phoneNumber: e164,
				code: challenge.code,
				newPassword: password,
				confirmPassword: confirm,
			});
			goTo("success");
		} catch (e) {
			// The code ran out (or was burned) while the password was being typed:
			// back to the code step, which says why and offers a new code.
			if (isCodeRefused(e)) {
				goTo("code");
				challenge.refuse(e);
			} else {
				setBanner(describeApiReason(e, "auth.reset.changeFailed"));
			}
		} finally {
			setBusy(false);
		}
	};

	const toLogin = () => navigate(PATHS.login, { state: { phone } satisfies LoginPrefill });
	const passwordErr = tried ? passwordError(password) : null;
	const confirmErr = tried ? confirmError(password, confirm) : null;
	const bannerBox = banner && (
		<Box sx={{ mb: "18px" }}>
			<AuthBanner>{banner}</AuthBanner>
		</Box>
	);

	if (step === "code") {
		return (
			<AuthLayout>
				<AuthCodeStep
					title={t("auth.reset.codeTitle")}
					subtitle={t("auth.reset.codeSubtitle", {
						count: challenge.codeLength,
						phone: maskedPhone(phone),
					})}
					challenge={challenge}
					submitLabel={t("auth.reset.codeSubmit")}
					busy={busy}
					onSubmit={() => void verifyCode()}
					onResend={() => void resend()}
					backLabel={t("auth.reset.changePhone")}
					onBack={() => goTo("phone")}
				/>
			</AuthLayout>
		);
	}

	if (step === "newpass") {
		return (
			<AuthLayout>
				<AuthHead title={t("auth.reset.newTitle")} subtitle={t("auth.reset.newSubtitle")} />
				{bannerBox}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
					<AuthPasswordField
						label={t("auth.field.newPassword")}
						value={password}
						autoFocus
						placeholder={t("auth.field.passwordMin")}
						autoComplete="new-password"
						error={passwordErr ? t(passwordErr) : undefined}
						onChange={setPassword}
					/>
					<AuthPasswordField
						label={t("auth.field.confirmPassword")}
						value={confirm}
						placeholder={t("auth.field.confirmPlaceholder")}
						autoComplete="new-password"
						error={confirmErr ? t(confirmErr) : undefined}
						onChange={setConfirm}
						onEnter={() => void savePassword()}
					/>
				</Box>
				<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
					<Button
						variant="contained"
						fullWidth
						disabled={busy}
						onClick={() => void savePassword()}
						sx={submitSx}
					>
						{t("auth.reset.changeSubmit")}
					</Button>
					<AuthBackLink onClick={toLogin}>{t("auth.reset.backToLogin")}</AuthBackLink>
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
					<Button variant="contained" fullWidth onClick={toLogin} sx={submitSx}>
						{t("auth.reset.successLogin")}
					</Button>
				</Box>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<AuthHead title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")} />
			{bannerBox}
			<AuthPhoneField
				label={t("auth.field.phone")}
				value={phone}
				autoFocus
				error={tried && phoneErrorOf(phone) ? t(phoneErrorOf(phone)!) : undefined}
				onChange={(v) => {
					setPhone(v);
					setBanner(null);
				}}
				onEnter={() => void sendCode()}
			/>
			<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
				<Button
					variant="contained"
					fullWidth
					disabled={busy}
					onClick={() => void sendCode()}
					sx={submitSx}
				>
					{t("auth.reset.sendCode")}
				</Button>
				<AuthBackLink onClick={toLogin}>{t("auth.reset.backToLogin")}</AuthBackLink>
			</Box>
		</AuthLayout>
	);
});

export default ResetPasswordPage;
