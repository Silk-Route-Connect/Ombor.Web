import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthAltLine, AuthHead, AuthLink } from "components/auth/AuthChrome";
import { AuthBanner, AuthPasswordField, AuthPhoneField } from "components/auth/AuthFields";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { phoneError as phoneErrorOf } from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import { Box, Button } from "@mui/material";

const LoginPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { authStore } = useStore();

	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [tried, setTried] = useState(false);
	const [banner, setBanner] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const phoneErr = tried ? phoneErrorOf(phone) : null;
	const passwordErr = tried && !password ? "auth.errors.required" : null;

	const submit = async () => {
		setTried(true);
		setBanner(null);
		if (phoneErrorOf(phone) || !password) {
			return;
		}
		setSubmitting(true);
		try {
			await authStore.login({
				phoneNumber: normalizeUzPhoneToE164(phone),
				password,
			});
			// On success the store sets auth + redirects to the app.
		} catch {
			setBanner(t("auth.login.failed"));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AuthLayout>
			<AuthHead title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} />

			{banner && (
				<Box sx={{ mb: "18px" }}>
					<AuthBanner>{banner}</AuthBanner>
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
