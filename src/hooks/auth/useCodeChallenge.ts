import React from "react";
import i18next from "i18n/config";
import { CodeIssuedResponse } from "models/auth";
import { codeFailureText, isCodeGone, retryAfterSeconds } from "utils/authErrors";

import { useCountdown } from "./useCountdown";

/** Served defaults (backend-contracts/auth.md), used only if a response omits a field. */
const DEFAULT_CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;
const DEFAULT_EXPIRES_MINUTES = 5;

const positive = (value: unknown, fallback: number): number =>
	typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;

export interface CodeChallenge {
	/** What the user typed so far. */
	code: string;
	/** Typing clears the previous refusal. */
	setCode: (value: string) => void;
	/** Why the code was refused — or, once it is used up, why (null: it timed out). */
	error: string | null;
	/** Digits to ask for — the served `codeLength`. */
	codeLength: number;
	/** Seconds until «Отправить ещё раз» is offered (0 = offered now). */
	resendSeconds: number;
	/** Seconds the current code stays valid. */
	expirySeconds: number;
	/** A code was sent and can no longer be used (timed out, or the server said it is gone). */
	expired: boolean;
	/** A code was just sent: clear the input, size it and restart both timers from the response. */
	issue: (response: Partial<CodeIssuedResponse>) => void;
	/** Before calling the server: false (and says why) while the code is short or expired. */
	readyToSend: () => boolean;
	/** The server refused the code (or the call failed): say why; a gone code needs a new one. */
	refuse: (cause: unknown) => void;
	/** A 429 on (re)send: keep «Отправить ещё раз» back for as long as the server asks. */
	holdResend: (cause: unknown) => void;
}

/**
 * State of a one-time SMS code (registration OTP, password reset): the typed
 * digits, how many there are, when another may be requested and when the code
 * stops working — all from the server's answer, never constants (auth-18).
 */
export function useCodeChallenge(): CodeChallenge {
	const [code, setCodeValue] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	// Kept apart from `error`: typing or a click on a used-up code clears `error`,
	// but «слишком много неверных попыток» must not turn into «код истёк».
	const [goneReason, setGoneReason] = React.useState<string | null>(null);
	const [codeLength, setCodeLength] = React.useState(DEFAULT_CODE_LENGTH);
	const [issued, setIssued] = React.useState(false);
	const resend = useCountdown(0);
	const expiry = useCountdown(0);
	const startResend = resend.start;
	const startExpiry = expiry.start;
	const expired = issued && expiry.seconds === 0;

	const setCode = React.useCallback((value: string) => {
		setCodeValue(value);
		setError(null);
	}, []);

	const issue = React.useCallback(
		(response: Partial<CodeIssuedResponse>) => {
			setCodeValue("");
			setError(null);
			setGoneReason(null);
			setCodeLength(positive(response.codeLength, DEFAULT_CODE_LENGTH));
			startResend(positive(response.resendAfterSeconds, DEFAULT_RESEND_SECONDS));
			startExpiry(positive(response.expiresInMinutes, DEFAULT_EXPIRES_MINUTES) * 60);
			setIssued(true);
		},
		[startResend, startExpiry],
	);

	const readyToSend = (): boolean => {
		// An expired code needs no round trip: the «код истёк» line is already shown.
		setError(null);
		if (expired) {
			return false;
		}
		if (code.length < codeLength) {
			setError(i18next.t("auth.errors.codeIncomplete", { count: codeLength }));
			return false;
		}
		return true;
	};

	const refuse = React.useCallback(
		(cause: unknown) => {
			if (isCodeGone(cause)) {
				setGoneReason(codeFailureText(cause));
				startExpiry(0);
			}
			setError(codeFailureText(cause));
		},
		[startExpiry],
	);

	const holdResend = React.useCallback(
		(cause: unknown) => {
			const wait = retryAfterSeconds(cause);
			if (wait !== null) {
				startResend(wait);
			}
		},
		[startResend],
	);

	return {
		code,
		setCode,
		error: expired ? goneReason : error,
		codeLength,
		resendSeconds: resend.seconds,
		expirySeconds: expiry.seconds,
		expired,
		issue,
		readyToSend,
		refuse,
		holdResend,
	};
}
