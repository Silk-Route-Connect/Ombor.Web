import i18n from "i18n/config";
import {
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	LoginRequest,
	LoginResponse,
	RefreshTokenResponse,
	RegisterRequest,
	RegisterResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	VerifyOtpResponse,
	VerifyPhoneRequest,
	VerifyResetCodeRequest,
	VerifyResetCodeResponse,
} from "models/auth";
import http from "services/api/http";

const AUTH_BASE = "/api/auth" as const;

/**
 * The active UI locale for the `X-Ombor-Language` header — the backend seeds the
 * new organization's language from it (verification SMS, defaults). Read live
 * from the i18n instance (which the register-form language footer drives), so it
 * follows the user's selection as more languages land. `resolvedLanguage`
 * accounts for the fallback; defaults to `ru`.
 */
const activeLanguage = (): string => {
	const lng = i18n.resolvedLanguage ?? i18n.language ?? "ru";
	// The backend validates against {ru, uz-Latn, uz-Cyrl}; the app's `uz` locale
	// must be sent as `uz-Latn` (ru / uz-Cyrl already match).
	return lng === "uz" ? "uz-Latn" : lng;
};

/**
 * Axios request config carrying the active UI language via the `X-Ombor-Language`
 * header. The backend REQUIRES this on the OTP flows (registration `verification`)
 * to localize the SMS and validates it against {ru, uz-Latn, uz-Cyrl}. Sent on
 * every auth call that can trigger a localized SMS so none regress the
 * missing-header 400.
 */
const withLanguage = () => ({
	headers: {
		"X-Ombor-Language": activeLanguage(),
	},
});

export const AuthEndpoints = {
	base: AUTH_BASE,
	login: `${AUTH_BASE}/login`,
	register: `${AUTH_BASE}/register`,
	verification: `${AUTH_BASE}/verification`,
	refresh: `${AUTH_BASE}/refresh-token`,
	logout: `${AUTH_BASE}/logout`,
	forgotPassword: `${AUTH_BASE}/forgot-password`,
	verifyResetCode: `${AUTH_BASE}/verify-reset-code`,
	resetPassword: `${AUTH_BASE}/reset-password`,
} as const;

class AuthApi {
	async login(request: LoginRequest): Promise<LoginResponse> {
		const { data } = await http.post<LoginResponse>(AuthEndpoints.login, request);

		return data;
	}

	async register(request: RegisterRequest): Promise<RegisterResponse> {
		const { data } = await http.post<RegisterResponse>(
			AuthEndpoints.register,
			request,
			withLanguage(),
		);

		return data;
	}

	async verifyPhone(request: VerifyPhoneRequest): Promise<VerifyOtpResponse> {
		const { data } = await http.post<VerifyOtpResponse>(
			AuthEndpoints.verification,
			request,
			withLanguage(),
		);

		return data;
	}

	private refreshInFlight: Promise<RefreshTokenResponse> | null = null;

	/**
	 * Concurrent callers share one request: the refresh cookie is single-use, so a
	 * second parallel call (StrictMode's double app-start effect, or app start racing
	 * the 401 interceptor) would present an already-rotated token and sign the user out.
	 */
	refresh(): Promise<RefreshTokenResponse> {
		this.refreshInFlight ??= http
			.post<RefreshTokenResponse>(
				AuthEndpoints.refresh,
				{}, // Empty body - cookie will be sent automatically
				{
					withCredentials: true,
				},
			)
			.then(({ data }) => data)
			.finally(() => {
				this.refreshInFlight = null;
			});

		return this.refreshInFlight;
	}

	async logout(): Promise<void> {
		await http.post<void>(AuthEndpoints.logout);
	}

	/* ── Password reset (see models/auth.ts) ── */

	async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
		const { data } = await http.post<ForgotPasswordResponse>(
			AuthEndpoints.forgotPassword,
			request,
			withLanguage(),
		);

		return data;
	}

	async verifyResetCode(request: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> {
		const { data } = await http.post<VerifyResetCodeResponse>(
			AuthEndpoints.verifyResetCode,
			request,
			withLanguage(),
		);

		return data;
	}

	async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
		const { data } = await http.post<ResetPasswordResponse>(
			AuthEndpoints.resetPassword,
			request,
			withLanguage(),
		);

		return data;
	}
}

export const authApi = new AuthApi();
export default AuthApi;
