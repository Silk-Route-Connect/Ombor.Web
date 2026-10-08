import React from "react";
import { useTranslation } from "react-i18next";
import { CodeChallenge } from "hooks/auth/useCodeChallenge";
import { radius } from "theme";

import { Box, Button } from "@mui/material";

import { AuthBackLink, AuthHead } from "./AuthChrome";
import { AuthCodeInput } from "./AuthFields/AuthCodeInput";
import CodeTimers from "./CodeTimers";

interface AuthCodeStepProps {
	title: string;
	subtitle: string;
	challenge: CodeChallenge;
	submitLabel: string;
	busy: boolean;
	onSubmit: () => void;
	onResend: () => void;
	backLabel: string;
	onBack: () => void;
}

/**
 * The «enter the SMS code» step shared by registration and password reset: one
 * cell per served digit, how long the code still works, resend with its
 * countdown, and why a code was refused.
 */
const AuthCodeStep: React.FC<AuthCodeStepProps> = ({
	title,
	subtitle,
	challenge,
	submitLabel,
	busy,
	onSubmit,
	onResend,
	backLabel,
	onBack,
}) => {
	const { t } = useTranslation();
	const error = challenge.error ?? (challenge.expired ? t("auth.errors.codeExpired") : undefined);

	return (
		<>
			<AuthHead title={title} subtitle={subtitle} />
			<AuthCodeInput
				value={challenge.code}
				onChange={challenge.setCode}
				length={challenge.codeLength}
				autoFocus
				error={error}
				onEnter={onSubmit}
			/>
			<CodeTimers challenge={challenge} onResend={onResend} />
			<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
				<Button
					variant="contained"
					fullWidth
					disabled={busy}
					onClick={onSubmit}
					sx={{ height: 46, fontSize: 15, borderRadius: `${radius.md}px` }}
				>
					{submitLabel}
				</Button>
				<AuthBackLink onClick={onBack}>{backLabel}</AuthBackLink>
			</Box>
		</>
	);
};

export default AuthCodeStep;
