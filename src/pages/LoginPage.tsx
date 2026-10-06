import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAltLine, AuthHead, AuthLink } from "components/auth/AuthChrome";
import { AuthBanner } from "components/auth/AuthFields/AuthBanner";
import { AuthPasswordField } from "components/auth/AuthFields/AuthPasswordField";
import { AuthPhoneField } from "components/auth/AuthFields/AuthPhoneField";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { readLoginPrefill } from "routing/navigationState";
import { PATHS } from "routing/paths";
import { analytics } from "services/telemetry";
import { useStore } from "stores/StoreContext";
import { loginFailureText } from "utils/authErrors";
import { phoneError as phoneErrorOf } from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import { Box, Button } from "@mui/material";

const LoginPage: React.FC = observer(() => {
	const { t } = useTranslation();
	useDocumentTitle(t("auth.login.title"));
	const navigate = useNavigate();
	const location = useLocation();
	const { authStore } = useStore();

	// After a password reset the number is already known — don't make them retype it.
	const [phone, setPhone] = useState(() => readLoginPrefill(location.state));
	const [password, setPassword] = useState("");
	const [tried, setTried] = useState(false);
	const [banner, setBanner] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const phoneErr = tried ? phoneErrorOf(phone) : null;
	const passwordErr = tried && !password ? "auth.errors.required" : null;
	const notice = authStore.signOutNotice;

	const submit = async () => {
		setTried(true);
		setBanner(null);
		if (submitting) {
			return;
		}
		if (phoneErrorOf(phone) || !password) {
			const failed = [phoneErrorOf(phone) ? "phone" : null, !password ? "password" : null].filter(
				(f): f is string => f !== null,
			);
			analytics.capture("form_validation_failed", {
				form: "login",
				field_count: failed.length,
				first_field: failed[0],
			});
			return;
		}
		setSubmitting(true);
		try {
			await authStore.login({
				phoneNumber: normalizeUzPhoneToE164(phone),
				password,
			});
			// On success the store sets auth + redirects to the app.
		} catch (e) {
			setBanner(loginFailureText(e));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AuthLayout>
			<AuthHead title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} />

			{(banner || notice) && (
				<Box sx={{ mb: "18px" }}>
					{banner ? (
						<AuthBanner>{banner}</AuthBanner>
					) : (
						<AuthBanner tone="info">{t(`auth.login.signedOut.${notice}`)}</AuthBanner>
					)}
				</Box>
			)}

			<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<AuthPhoneField
					label={t("auth.field.phone")}
					value={phone}
					autoFocus
					error={phoneErr ? t(phoneErr) : undefined}
					onChange={(v) => {
						setPhone(v);
						setBanner(null);
					}}
					onEnter={() => void submit()}
				/>
				<Box>
					<AuthPasswordField
						label={t("auth.field.password")}
						value={password}
						autoComplete="current-password"
						error={passwordErr ? t(passwordErr) : undefined}
						onChange={(v) => {
							setPassword(v);
							setBanner(null);
						}}
						onEnter={() => void submit()}
					/>
					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: "8px" }}>
						<AuthLink onClick={() => navigate(PATHS.resetPassword)}>
							{t("auth.login.forgot")}
						</AuthLink>
					</Box>
				</Box>
			</Box>

			<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
				<Button
					variant="contained"
					fullWidth
					disabled={submitting}
					onClick={() => void submit()}
					sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
				>
					{t("auth.login.submit")}
				</Button>
				<AuthAltLine>
					{t("auth.login.noAccount")}{" "}
					<AuthLink onClick={() => navigate(PATHS.register)}>{t("auth.login.create")}</AuthLink>
				</AuthAltLine>
			</Box>
		</AuthLayout>
	);
});

export default LoginPage;
