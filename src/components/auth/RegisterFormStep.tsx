import React from "react";
import { useTranslation } from "react-i18next";
import { RegisterForm } from "hooks/auth/useRegisterForm";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Box, Button } from "@mui/material";

import { AuthAltLine, AuthHead, AuthLink } from "./AuthChrome";
import { AuthBanner } from "./AuthFields/AuthBanner";
import { AuthPasswordField } from "./AuthFields/AuthPasswordField";
import { AuthPhoneField } from "./AuthFields/AuthPhoneField";
import { AuthTextField } from "./AuthFields/AuthTextField";
import { SectionEyebrow } from "./AuthFields/SectionEyebrow";
import { TermsCheckbox } from "./AuthFields/TermsCheckbox";

interface RegisterFormStepProps {
	form: RegisterForm;
	submitting: boolean;
	onSubmit: () => void;
	onLogin: () => void;
}

/** «Создать аккаунт»: business + account fields, terms, submit. */
const RegisterFormStep: React.FC<RegisterFormStepProps> = ({
	form,
	submitting,
	onSubmit,
	onLogin,
}) => {
	const { t } = useTranslation();
	const { values, set, errors, termsError, banner } = form;
	const errorText = (key?: string) => (key ? t(key) : undefined);

	return (
		<>
			<AuthHead title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

			{banner && (
				<Box sx={{ mb: "18px" }}>
					<AuthBanner>{banner}</AuthBanner>
				</Box>
			)}

			<Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<SectionEyebrow>{t("auth.register.sectionBusiness")}</SectionEyebrow>
				<AuthTextField
					label={t("auth.field.company")}
					icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
					value={values.company}
					autoFocus
					placeholder={t("auth.field.companyPlaceholder")}
					error={errorText(errors.company)}
					onChange={(v) => set("company", v)}
				/>

				<Box sx={{ mt: "4px" }}>
					<SectionEyebrow>{t("auth.register.sectionAccount")}</SectionEyebrow>
				</Box>
				<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
					<AuthTextField
						label={t("auth.field.firstName")}
						icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
						value={values.firstName}
						placeholder={t("auth.field.firstNamePlaceholder")}
						error={errorText(errors.firstName)}
						onChange={(v) => set("firstName", v)}
					/>
					<AuthTextField
						label={t("auth.field.lastName")}
						value={values.lastName}
						placeholder={t("auth.field.lastNamePlaceholder")}
						error={errorText(errors.lastName)}
						onChange={(v) => set("lastName", v)}
					/>
				</Box>
				<AuthPhoneField
					label={t("auth.field.phone")}
					value={values.phone}
					error={errorText(errors.phone)}
					onChange={(v) => set("phone", v)}
				/>
				<AuthPasswordField
					label={t("auth.field.password")}
					value={values.password}
					placeholder={t("auth.field.passwordMin")}
					autoComplete="new-password"
					error={errorText(errors.password)}
					onChange={(v) => set("password", v)}
				/>
				<AuthPasswordField
					label={t("auth.field.confirmPassword")}
					value={values.confirm}
					placeholder={t("auth.field.confirmPlaceholder")}
					autoComplete="new-password"
					error={errorText(errors.confirm)}
					onChange={(v) => set("confirm", v)}
					onEnter={onSubmit}
				/>
			</Box>

			<Box sx={{ mt: "16px" }}>
				<TermsCheckbox
					checked={values.terms}
					error={termsError}
					onChange={() => set("terms", !values.terms)}
				>
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
					onClick={onSubmit}
					sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
				>
					{t("auth.register.submit")}
				</Button>
				<AuthAltLine>
					{t("auth.register.haveAccount")}{" "}
					<AuthLink onClick={onLogin}>{t("auth.register.login")}</AuthLink>
				</AuthAltLine>
			</Box>
		</>
	);
};

export default RegisterFormStep;
