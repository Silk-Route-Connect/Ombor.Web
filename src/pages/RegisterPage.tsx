import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
	AuthAltLine,
	AuthBackLink,
	AuthHead,
	AuthLink,
	AuthSuccessBadge,
} from "components/auth/AuthChrome";
import {
	AuthBanner,
	AuthCodeInput,
	AuthPasswordField,
	AuthPhoneField,
	AuthTextField,
	SectionEyebrow,
	TermsCheckbox,
} from "components/auth/AuthFields";
import { useCountdown } from "hooks/auth/useCountdown";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { RegisterRequest } from "models/auth";
import { PATHS } from "routing/paths";
import { analytics } from "services/telemetry";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";
import {
	confirmError,
	maskedPhone,
	passwordError,
	phoneError as phoneErrorOf,
	requiredError,
} from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Button, Typography } from "@mui/material";

type Step = "form" | "otp" | "welcome";
const RESEND_SECONDS = 60;
const OTP_LENGTH = 4;

const RegisterPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { authStore, notificationStore } = useStore();

	const [step, setStep] = useState<Step>("form");

	// form
	const [company, setCompany] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [terms, setTerms] = useState(false);
	const [tried, setTried] = useState(false);
	const [banner, setBanner] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// otp
	const [registration, setRegistration] = useState<RegisterRequest | null>(null);
	const [e164, setE164] = useState("");
	const [code, setCode] = useState("");
	const [codeTried, setCodeTried] = useState(false);
	const [codeInvalid, setCodeInvalid] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [resending, setResending] = useState(false);
	const { seconds, start } = useCountdown(RESEND_SECONDS);

	// welcome
	const [accessToken, setAccessToken] = useState("");

	const E = {
		company: tried ? requiredError(company) : null,
		firstName: tried ? requiredError(firstName) : null,
		lastName: tried ? requiredError(lastName) : null,
		phone: tried ? phoneErrorOf(phone) : null,
		password: tried ? passwordError(password) : null,
		confirm: tried ? confirmError(password, confirm) : null,
		terms: tried && !terms,
	};
	const hasError = Object.values(E).some(Boolean);

	const submitForm = async () => {
		setTried(true);
		setBanner(null);
		const failed = [
			requiredError(company) ? "company" : null,
			requiredError(firstName) ? "first_name" : null,
			requiredError(lastName) ? "last_name" : null,
			phoneErrorOf(phone) ? "phone" : null,
			passwordError(password) ? "password" : null,
			confirmError(password, confirm) ? "confirm" : null,
			!terms ? "terms" : null,
		].filter((f): f is string => f !== null);
		if (failed.length > 0) {
			analytics.capture("form_validation_failed", {
				form: "register",
				field_count: failed.length,
				first_field: failed[0],
			});
			return;
		}
		const phoneE164 = normalizeUzPhoneToE164(phone);
		const request: RegisterRequest = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			phoneNumber: phoneE164,
			password,
			confirmPassword: confirm,
			organizationName: company.trim(),
		};
		setSubmitting(true);
		try {
			const response = await authStore.register(request);
			setRegistration(request);
			setE164(phoneE164);
			setCode("");
			setCodeTried(false);
			setCodeInvalid(false);
			setStep("otp");
			start(RESEND_SECONDS);
			notificationStore.success(t("auth.otp.sent", { phone: maskedPhone(phone) }));
			void response;
		} catch {
			setBanner(t("auth.register.failed"));
		} finally {
			setSubmitting(false);
		}
	};

	const submitOtp = async () => {
		setCodeTried(true);
		setCodeInvalid(false);
		if (code.length < OTP_LENGTH) {
			return;
		}
		setVerifying(true);
		try {
			const token = await authStore.verifyOtp({ phoneNumber: e164, code });
			setAccessToken(token);
			setStep("welcome");
		} catch {
			// Keep the entered code and flag it invalid so the user sees
			// «Неверный код», not the length-based «code incomplete» message.
			setCodeInvalid(true);
		} finally {
			setVerifying(false);
		}
	};

	const resend = async () => {
		if (seconds > 0 || resending || !registration) {
			return;
		}
		setResending(true);
		setCodeInvalid(false);
		try {
			await authStore.register(registration);
			start(RESEND_SECONDS);
			notificationStore.success(t("auth.otp.resent"));
		} catch {
			notificationStore.error(t("auth.otp.failed"));
		} finally {
			setResending(false);
		}
	};

	const codeErr = codeInvalid
		? "auth.errors.codeInvalid"
		: codeTried && code.length < OTP_LENGTH
			? "auth.errors.codeIncomplete"
			: null;

	if (step === "otp") {
		return (
			<AuthLayout>
				<AuthHead
					title={t("auth.otp.title")}
					subtitle={t("auth.otp.subtitle", { phone: maskedPhone(phone) })}
				/>
				<AuthCodeInput
					value={code}
					onChange={(v) => {
						setCode(v);
						setCodeInvalid(false);
					}}
					length={OTP_LENGTH}
					autoFocus
					error={codeErr ? t(codeErr) : undefined}
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
				<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
					<Button
						variant="contained"
						fullWidth
						disabled={verifying}
						onClick={() => void submitOtp()}
						sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
					>
						{t("auth.otp.submit")}
					</Button>
					<AuthBackLink onClick={() => setStep("form")}>{t("auth.otp.changePhone")}</AuthBackLink>
				</Box>
			</AuthLayout>
		);
	}

	if (step === "welcome") {
		const steps: Array<[React.ElementType, string, string]> = [
			[
				Inventory2OutlinedIcon,
				t("auth.welcome.step.products.title"),
				t("auth.welcome.step.products.body"),
			],
			[
				PeopleAltOutlinedIcon,
				t("auth.welcome.step.partners.title"),
				t("auth.welcome.step.partners.body"),
			],
			[
				WarehouseOutlinedIcon,
				t("auth.welcome.step.warehouse.title"),
				t("auth.welcome.step.warehouse.body"),
			],
		];
		return (
			<AuthLayout>
				<Box sx={{ textAlign: "center" }}>
					<AuthSuccessBadge />
					<Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
						{t("auth.welcome.title")}
					</Typography>
					<Typography sx={{ fontSize: 14, color: "text.secondary", mt: "6px" }}>
						{t("auth.welcome.subtitle", { company })}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mt: "22px" }}>
					{steps.map(([Icon, title, body], i) => (
						<Box
							key={title}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "13px",
								p: "12px 13px",
								borderRadius: "8px",
								border: "1px solid",
								borderColor: "divider",
								bgcolor: designTokens.gray25,
							}}
						>
							<Box
								sx={{
									width: 38,
									height: 38,
									flex: "0 0 auto",
									borderRadius: "8px",
									bgcolor: designTokens.primarySoft,
									color: "primary.main",
									display: "grid",
									placeItems: "center",
								}}
							>
								<Icon sx={{ fontSize: 19 }} />
							</Box>
							<Box>
								<Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
									{i + 1}. {title}
								</Typography>
								<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "1px" }}>
									{body}
								</Typography>
							</Box>
						</Box>
					))}
				</Box>
				<Box sx={{ mt: "22px" }}>
					<Button
						variant="contained"
						fullWidth
						onClick={() => authStore.enterWithTokens(accessToken)}
						sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
					>
						{t("auth.welcome.start")}
					</Button>
				</Box>
			</AuthLayout>
		);
	}

	// step === "form"
	return (
		<AuthLayout>
			<AuthHead title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

			{banner && (
				<Box sx={{ mb: "18px" }}>
					<AuthBanner>{banner}</AuthBanner>
				</Box>
			)}

			{tried && hasError && (
				<Box sx={{ mb: "18px" }}>
					<AuthBanner>{t("auth.register.bannerErrors")}</AuthBanner>
				</Box>
			)}

			<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<SectionEyebrow>{t("auth.register.sectionBusiness")}</SectionEyebrow>
				<AuthTextField
					label={t("auth.field.company")}
					icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
					value={company}
					autoFocus
					placeholder={t("auth.field.companyPlaceholder")}
					error={E.company ? t(E.company) : undefined}
					onChange={setCompany}
				/>

				<Box sx={{ mt: "4px" }}>
					<SectionEyebrow>{t("auth.register.sectionAccount")}</SectionEyebrow>
				</Box>
				<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
					<AuthTextField
						label={t("auth.field.firstName")}
						icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
						value={firstName}
						placeholder={t("auth.field.firstNamePlaceholder")}
						error={E.firstName ? t(E.firstName) : undefined}
						onChange={setFirstName}
					/>
					<AuthTextField
						label={t("auth.field.lastName")}
						value={lastName}
						placeholder={t("auth.field.lastNamePlaceholder")}
						error={E.lastName ? t(E.lastName) : undefined}
						onChange={setLastName}
					/>
				</Box>
				<AuthPhoneField
					label={t("auth.field.phone")}
					value={phone}
					error={E.phone ? t(E.phone) : undefined}
					onChange={setPhone}
				/>
				<AuthPasswordField
					label={t("auth.field.password")}
					value={password}
					placeholder={t("auth.field.passwordMin")}
					autoComplete="new-password"
					error={E.password ? t(E.password) : undefined}
					onChange={setPassword}
				/>
				<AuthPasswordField
					label={t("auth.field.confirmPassword")}
					value={confirm}
					placeholder={t("auth.field.confirmPlaceholder")}
					autoComplete="new-password"
					error={E.confirm ? t(E.confirm) : undefined}
					onChange={setConfirm}
					onEnter={() => void submitForm()}
				/>
			</Box>

			<Box sx={{ mt: "16px" }}>
				<TermsCheckbox checked={terms} error={E.terms} onChange={() => setTerms((v) => !v)}>
					{t("auth.terms.prefix")}{" "}
					<AuthLink onClick={() => undefined}>{t("auth.terms.terms")}</AuthLink>{" "}
					{t("auth.terms.and")}{" "}
					<AuthLink onClick={() => undefined}>{t("auth.terms.privacy")}</AuthLink>
				</TermsCheckbox>
			</Box>

			<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
				<Button
					variant="contained"
					fullWidth
					disabled={submitting}
					onClick={() => void submitForm()}
					sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
				>
					{t("auth.register.submit")}
				</Button>
				<AuthAltLine>
					{t("auth.register.haveAccount")}{" "}
					<AuthLink onClick={() => navigate(PATHS.login)}>{t("auth.register.login")}</AuthLink>
				</AuthAltLine>
			</Box>
		</AuthLayout>
	);
});

export default RegisterPage;
