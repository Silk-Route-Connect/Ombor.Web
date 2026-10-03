export interface LoginRequest {
	phoneNumber: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string; // returned, but we won’t store it client-side
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

export interface RegisterResponse {
	message: string;
	expiresInMinutes: number; // OTP lifetime
}

export interface VerifyPhoneRequest {
	phoneNumber: string;
	code: string; // 4 digits
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

export interface ForgotPasswordResponse {
	message: string;
	expiresInMinutes: number; // reset-code lifetime
}

export interface VerifyResetCodeRequest {
	phoneNumber: string;
	code: string; // 4 digits
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
