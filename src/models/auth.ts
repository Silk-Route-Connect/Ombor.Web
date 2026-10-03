export interface LoginRequest {
	phoneNumber: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	/** Also set as the httpOnly `ombor.refreshToken` cookie — the client never reads this copy. */
	refreshToken: string;
	/** The user's saved interface language (`ru` / `uz-Latn` / `uz-Cyrl`). */
	language: string;
}

export interface RegisterRequest {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	password: string;
	confirmPassword: string;
	organizationName: string;
	email?: string | null;
	telegramAccount?: string | null;
}

/**
 * What the server says about a one-time code it just sent (register and
 * forgot-password): how many digits to ask for and when another may be requested.
 * The client sizes its code input and timers from these, never from a constant.
 */
export interface CodeIssuedResponse {
	message: string;
	/** Code lifetime in minutes (5). */
	expiresInMinutes: number;
	/** Digits in the sent code (6 by default, server-configurable 4–8). */
	codeLength: number;
	/** Seconds before another code may be requested for this phone. */
	resendAfterSeconds: number;
}

export type RegisterResponse = CodeIssuedResponse;

export interface VerifyPhoneRequest {
	phoneNumber: string;
	code: string;
}

export type VerifyOtpResponse =
	| {
			success: true;
			accessToken: string;
			refreshToken: string;
			message?: string;
	  }
	| {
			success: false;
			accessToken?: null;
			refreshToken?: null;
			message?: string;
			/** `auth.code_invalid` / `auth.code_expired` / `auth.too_many_attempts`. */
			code?: string;
	  };

export interface RefreshTokenResponse {
	accessToken: string;
	/** Also set as the httpOnly cookie — the client never reads this copy. */
	refreshToken: string;
}

/* ───────────────────────── Password reset ─────────────────────────
 * Served by `/api/auth/forgot-password`, `/verify-reset-code` and
 * `/reset-password` (backend-contracts/auth.md). Flow: request a code →
 * verify it → set a new password.
 */

export interface ForgotPasswordRequest {
	phoneNumber: string;
}

export type ForgotPasswordResponse = CodeIssuedResponse;

export interface VerifyResetCodeRequest {
	phoneNumber: string;
	code: string;
}

export type VerifyResetCodeResponse =
	| { success: true; message?: string }
	| { success: false; message?: string; code?: string };

export interface ResetPasswordRequest {
	phoneNumber: string;
	code: string;
	newPassword: string;
	confirmPassword: string;
}

export type ResetPasswordResponse =
	| { success: true; message?: string }
	| { success: false; message?: string; code?: string };
