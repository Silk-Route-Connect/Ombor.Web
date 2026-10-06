import React from "react";
import { useTranslation } from "react-i18next";
import { CodeChallenge } from "hooks/auth/useCodeChallenge";
import { numericSx } from "theme";
import { formatWait } from "utils/apiError";

import { Box, Typography } from "@mui/material";

import { AuthLink } from "./AuthChrome";

/** «4:05» */
const clock = (seconds: number): string =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

interface CodeTimersProps {
	challenge: CodeChallenge;
	onResend: () => void;
}

/**
 * Under the code cells: how long the code still works, and «Отправить ещё раз»
 * — a countdown until the server allows another code, then the button.
 */
const CodeTimers: React.FC<CodeTimersProps> = ({ challenge, onResend }) => {
	const { t } = useTranslation();
	const { expired, expirySeconds, resendSeconds } = challenge;

	return (
		<Box
			sx={{ mt: "14px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "center" }}
		>
			{!expired && expirySeconds > 0 && (
				<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
					{t("auth.code.validFor")}{" "}
					<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
						{clock(expirySeconds)}
					</Box>
				</Typography>
			)}
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
				{!expired && `${t("auth.otp.resendPrompt")} `}
				{resendSeconds > 0 ? (
					<Box component="span" sx={{ color: "text.disabled" }}>
						{t("auth.otp.resendIn", { wait: formatWait(resendSeconds) })}
					</Box>
				) : (
					<AuthLink onClick={onResend}>
						{expired ? t("auth.code.requestNew") : t("auth.otp.resend")}
					</AuthLink>
				)}
			</Typography>
		</Box>
	);
};

export default CodeTimers;
