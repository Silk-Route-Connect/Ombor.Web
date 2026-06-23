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
		const { data } = await http.post<RegisterResponse>(AuthEndpoints.register, request);

		return data;
	}

	async verifyPhone(request: VerifyPhoneRequest): Promise<VerifyOtpResponse> {
		const { data } = await http.post<VerifyOtpResponse>(AuthEndpoints.verification, request);

		return data;
	}

	async refresh(): Promise<RefreshTokenResponse> {
		const { data } = await http.post<RefreshTokenResponse>(
			AuthEndpoints.refresh,
			{}, // Empty body - cookie will be sent automatically
			{
				withCredentials: true,
			},
		);

		return data;
	}

	async logout(): Promise<void> {
		await http.post<void>(AuthEndpoints.logout);
	}

	/* ── Password reset (mocked target v1 contract — see models/auth.ts) ── */

	async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
		const { data } = await http.post<ForgotPasswordResponse>(AuthEndpoints.forgotPassword, request);

		return data;
	}

	async verifyResetCode(request: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> {
		const { data } = await http.post<VerifyResetCodeResponse>(
			AuthEndpoints.verifyResetCode,
			request,
		);

		return data;
	}

	async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
		const { data } = await http.post<ResetPasswordResponse>(AuthEndpoints.resetPassword, request);

		return data;
	}
}

export const authApi = new AuthApi();
export default AuthApi;
