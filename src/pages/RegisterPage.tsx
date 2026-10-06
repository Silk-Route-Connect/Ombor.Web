import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AuthCodeStep from "components/auth/AuthCodeStep";
import RegisterFormStep from "components/auth/RegisterFormStep";
import RegisterWelcome from "components/auth/RegisterWelcome";
import { useCodeChallenge } from "hooks/auth/useCodeChallenge";
import { useRegisterForm } from "hooks/auth/useRegisterForm";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { RegisterRequest } from "models/auth";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { describeApiReason } from "utils/apiError";
import { maskUzPhone } from "utils/phoneUtils";

type Step = "form" | "otp" | "welcome";

const RegisterPage: React.FC = observer(() => {
	const { t } = useTranslation();
	useDocumentTitle(t("auth.register.title"));
	const navigate = useNavigate();
	const { authStore, notificationStore } = useStore();

	const [step, setStep] = useState<Step>("form");
	const form = useRegisterForm();
	const challenge = useCodeChallenge();
	const [submitting, setSubmitting] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [resending, setResending] = useState(false);
	// The exact request whose code is on screen — a resend repeats it, the code
	// is checked against its phone even if the form was edited meanwhile.
	const [registration, setRegistration] = useState<RegisterRequest | null>(null);
	const [accessToken, setAccessToken] = useState("");

	const phoneMask = maskUzPhone(form.values.phone);

	const submitForm = async () => {
		if (submitting) {
			return;
		}
		const request = form.prepare();
		if (!request) {
			return;
		}
		setSubmitting(true);
		try {
			const response = await authStore.register(request);
			setRegistration(request);
			challenge.issue(response);
			setStep("otp");
			notificationStore.success(t("auth.otp.sent", { phone: phoneMask }));
		} catch (e) {
			form.fail(e);
		} finally {
			setSubmitting(false);
		}
	};

	const verify = async () => {
		if (verifying || !registration || !challenge.readyToSend()) {
			return;
		}
		setVerifying(true);
		try {
			const token = await authStore.verifyOtp({
				phoneNumber: registration.phoneNumber,
				code: challenge.code,
			});
			setAccessToken(token);
			setStep("welcome");
		} catch (e) {
			challenge.refuse(e);
		} finally {
			setVerifying(false);
		}
	};

	const resend = async () => {
		if (resending || !registration) {
			return;
		}
		setResending(true);
		try {
			challenge.issue(await authStore.register(registration));
			notificationStore.success(t("auth.otp.resent"));
		} catch (e) {
			challenge.holdResend(e);
			notificationStore.error(describeApiReason(e, "auth.otp.failed"));
		} finally {
			setResending(false);
		}
	};

	return (
		<AuthLayout>
			{step === "otp" ? (
				<AuthCodeStep
					title={t("auth.otp.title")}
					subtitle={t("auth.otp.subtitle", { count: challenge.codeLength, phone: phoneMask })}
					challenge={challenge}
					submitLabel={t("auth.otp.submit")}
					busy={verifying}
					onSubmit={() => void verify()}
					onResend={() => void resend()}
					backLabel={t("auth.otp.changePhone")}
					onBack={() => setStep("form")}
				/>
			) : step === "welcome" ? (
				<RegisterWelcome
					company={form.values.company.trim()}
					onStart={() => authStore.enterWithTokens(accessToken)}
				/>
			) : (
				<RegisterFormStep
					form={form}
					submitting={submitting}
					onSubmit={() => void submitForm()}
					onLogin={() => navigate(PATHS.login)}
				/>
			)}
		</AuthLayout>
	);
});

export default RegisterPage;
