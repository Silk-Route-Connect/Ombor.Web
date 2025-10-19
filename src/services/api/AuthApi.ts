import {
	LoginRequest,
	LoginResponse,
	RefreshTokenResponse,
	RegisterRequest,
	RegisterResponse,
	VerifyOtpResponse,
	VerifyPhoneRequest,
} from "models/auth";
import BaseApi from "services/api/BaseApi";
import http from "services/api/http";

const AUTH_BASE = "/api/auth" as const;

export const AuthEndpoints = {
	base: AUTH_BASE,
	login: `${AUTH_BASE}/login`,
	register: `${AUTH_BASE}/register`,
	verification: `${AUTH_BASE}/verification`,
	refresh: `${AUTH_BASE}/refresh-token`,
	logout: `${AUTH_BASE}/logout`,
} as const;

class AuthApi extends BaseApi {
	constructor() {
		super("auth");
	}

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

	/**
	 * Cookie-based refresh. No body is required for web.
	 * Backend reads the httpOnly cookie and returns new access/refresh tokens.
	 */
	async refresh(): Promise<RefreshTokenResponse> {
		const { data } = await http.post<RefreshTokenResponse>(
			AuthEndpoints.refresh,
			{}, // Empty body - cookie will be sent automatically
			{
				withCredentials: true, // Ensure credentials are sent
			},
		);

		return data;
	}

	async logout(): Promise<void> {
		await http.post<void>(AuthEndpoints.logout);
	}
}

export const authApi = new AuthApi();
export default AuthApi;
