import { makeAutoObservable, runInAction } from "mobx";
import {
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	LoginRequest,
	RegisterRequest,
	ResetPasswordRequest,
	VerifyPhoneRequest,
	VerifyResetCodeRequest,
} from "models/auth";
import { authApi } from "services/api/AuthApi";
import { AuthTokenBridge } from "services/auth/tokenBridge";

/** Auth lifecycle status for routing/guards */
export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

/** Optional user shape; extend when backend returns user info */
export interface AuthUser {
	id?: number;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	email?: string | null;
	organizationName?: string;
}

const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_PHONE = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone";
const CLAIM_ID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

/**
 * The backend exposes no /me endpoint yet — the access token's claims are
 * the only source of user identity (display name, phone, id). The tenant
 * name is not in the token; `organizationName` stays unset until the
 * backend provides it.
 */
function userFromAccessToken(token: string): AuthUser | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
		const fullName: string = payload[CLAIM_NAME] ?? "";
		const [firstName, ...rest] = fullName.split(" ").filter(Boolean);

		return {
			id: payload[CLAIM_ID] ? Number(payload[CLAIM_ID]) : undefined,
			firstName,
			lastName: rest.length > 0 ? rest.join(" ") : undefined,
			phoneNumber: payload[CLAIM_PHONE],
		};
	} catch {
		return null;
	}
}

/** Navigation/side-effect hooks provided by the app shell */
export interface AuthSideEffects {
	onRedirectToLogin?: () => void; // should navigate to /login with history replace
	onRedirectToApp?: () => void; // navigate to app home (dashboard)
	onResetAllStores?: () => void; // clear other MobX stores on logout
}

export class AuthStore {
	/** Short-lived access token (memory only) */
	private accessToken: string | null = null;

	/** Lightweight user info if/when available */
	private user: AuthUser | null = null;

	/** Auth lifecycle */
	public status: AuthStatus = "idle";

	/** Shell-provided callbacks */
	private sideEffects: AuthSideEffects = {};

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });

		// Wire bridges once at construction time
		AuthTokenBridge.registerGetAccessToken(this.getAccessToken);
		AuthTokenBridge.registerRefreshAccessToken(this.refresh);
		AuthTokenBridge.registerOnLogout(this.handleExternalLogout);
	}

	/* -------------------- Getters -------------------- */

	public get isAuthenticated(): boolean {
		return this.status === "authenticated" && this.accessToken !== null;
	}

	public getAccessToken(): string | null {
		return this.accessToken;
	}

	public getUser(): AuthUser | null {
		return this.user;
	}

	/* -------------------- Shell hooks -------------------- */

	public configureSideEffects(effects: AuthSideEffects): void {
		this.sideEffects = effects;
	}

	/* -------------------- Bootstrap -------------------- */

	/**
	 * Try a silent refresh on app start. Sets status accordingly.
	 */
	public async bootstrap(): Promise<void> {
		runInAction(() => {
			this.status = "checking";
		});

		try {
			const tokens = await authApi.refresh(); // cookie-based
			runInAction(() => {
				this.accessToken = tokens.accessToken;
				this.user = userFromAccessToken(tokens.accessToken);
				this.status = "authenticated";
			});
		} catch {
			runInAction(() => {
				this.accessToken = null;
				this.user = null;
				this.status = "unauthenticated";
			});
		}
	}

	/* -------------------- Auth flows -------------------- */

	/**
	 * Commit a fresh access token and enter the app. Shared by login and the
	 * post-registration welcome step ("Начать работу"), which obtains the token
	 * via `verifyOtp` first but only enters once the user dismisses the welcome.
	 */
	public enterWithTokens(accessToken: string): void {
		runInAction(() => {
			this.accessToken = accessToken;
			this.user = userFromAccessToken(accessToken);
			this.status = "authenticated";
		});

		if (this.sideEffects.onRedirectToApp) {
			this.sideEffects.onRedirectToApp();
		}
	}

	public async login(request: LoginRequest): Promise<void> {
		const result = await authApi.login(request);
		this.enterWithTokens(result.accessToken);
	}

	/**
	 * Register: server sends OTP; UI should navigate to OTP step.
	 * Returns server response (e.g., message, expiresInMinutes) for UI feedback.
	 */
	public async register(request: RegisterRequest) {
		return authApi.register(request);
	}

	/**
	 * Verify the registration OTP. On success the backend returns tokens and sets
	 * the refresh cookie; we return the access token WITHOUT entering the app yet,
	 * so the caller can show the welcome screen before `enterWithTokens` commits.
	 */
	public async verifyOtp(request: VerifyPhoneRequest): Promise<string> {
		const response = await authApi.verifyPhone(request);

		if (response.success !== true || !response.accessToken) {
			throw new Error(response.message ?? "OTP verification failed");
		}

		return response.accessToken;
	}

	/* ── Password reset (mocked target v1 contract). None of these enter the app —
	 * the user logs in afterwards with the new password. ── */

	public async requestPasswordReset(
		request: ForgotPasswordRequest,
	): Promise<ForgotPasswordResponse> {
		const response = await authApi.forgotPassword(request);
		// A well-formed response carries the code TTL. Anything else — including a
		// proxy 200 with no/HTML body when the endpoint is missing — is treated as a
		// failure so the page surfaces an error instead of silently advancing (F-023).
		if (typeof response?.expiresInMinutes !== "number") {
			throw new Error("Invalid forgot-password response");
		}
		return response;
	}

	public async verifyResetCode(request: VerifyResetCodeRequest): Promise<void> {
		const response = await authApi.verifyResetCode(request);
		if (response.success !== true) {
			throw new Error(response.message ?? "Reset code verification failed");
		}
	}

	public async resetPassword(request: ResetPasswordRequest): Promise<void> {
		const response = await authApi.resetPassword(request);
		if (response.success !== true) {
			throw new Error(response.message ?? "Password reset failed");
		}
	}

	/**
	 * Called by axios interceptor via AuthTokenBridge when a 401 happens.
	 * Must return a fresh access token string.
	 */
	public async refresh(): Promise<string> {
		const { accessToken } = await authApi.refresh();

		runInAction(() => {
			this.accessToken = accessToken;
			this.user = userFromAccessToken(accessToken);
			if (this.status !== "authenticated") {
				this.status = "authenticated";
			}
		});

		return accessToken;
	}

	/**
	 * User-initiated logout.
	 * Calls API, clears state, resets other stores, then redirects to /login.
	 */
	public async logout(): Promise<void> {
		try {
			await authApi.logout();
		} catch {
			// ignore network/logout errors; still clear local state
		} finally {
			runInAction(() => {
				this.accessToken = null;
				this.user = null;
				this.status = "unauthenticated";
			});

			if (this.sideEffects.onResetAllStores) {
				this.sideEffects.onResetAllStores();
			}
			if (this.sideEffects.onRedirectToLogin) {
				this.sideEffects.onRedirectToLogin();
			}
		}
	}

	/**
	 * Interceptor-triggered logout (refresh failed or unauthorized on auth route).
	 */
	private handleExternalLogout(reason: "refresh_failed" | "unauthorized"): void {
		// We intentionally don't await here to avoid blocking interceptor chains
		void this.logout();
	}
}

export const authStore = new AuthStore();
export default AuthStore;
