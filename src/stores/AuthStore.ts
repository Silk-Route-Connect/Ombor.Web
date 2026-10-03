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
import { AuthUser, userFromAccessToken } from "services/auth/accessTokenUser";
import { AuthTokenBridge } from "services/auth/tokenBridge";
import { analytics } from "services/telemetry";
import { ApiCodeError, parseApiError } from "utils/apiError";

/** Auth lifecycle status for routing/guards */
export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

/**
 * Why the app signed the user out on its own — shown once on the login page so
 * the user is not left wondering: the owner switched the account off, or the
 * session ended (a password change on another device, or it simply expired).
 */
export type SignOutNotice = "deactivated" | "sessionEnded";

const isDeactivated = (cause: unknown): boolean =>
	parseApiError(cause).code === "auth.account_deactivated";

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

	/** True while a logout runs — concurrent forced logouts collapse into one. */
	private loggingOut = false;

	/** Set by a forced sign-out, cleared by the next sign-in. */
	public signOutNotice: SignOutNotice | null = null;

	/** The last refresh was refused because the account is switched off (rule 41). */
	private refreshRefusedDeactivated = false;

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
			if (this.user) {
				analytics.identify(this.user);
			}
		} catch (e) {
			runInAction(() => {
				this.accessToken = null;
				this.user = null;
				this.status = "unauthenticated";
				// No cookie on a first visit is the normal case; only a switched-off
				// account deserves a word on the login page.
				this.signOutNotice = isDeactivated(e) ? "deactivated" : null;
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
			this.signOutNotice = null;
			this.accessToken = accessToken;
			this.user = userFromAccessToken(accessToken);
			this.status = "authenticated";
		});

		if (this.user) {
			analytics.identify(this.user);
		}

		if (this.sideEffects.onRedirectToApp) {
			this.sideEffects.onRedirectToApp();
		}
	}

	public async login(request: LoginRequest): Promise<void> {
		const result = await authApi.login(request);
		this.enterWithTokens(result.accessToken);
		// Here, not in enterWithTokens — the register-welcome commit shares that
		// method and must not count as a login.
		analytics.capture("user_logged_in");
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
			throw new ApiCodeError(
				response.success === false ? response.code : undefined,
				response.message ?? "OTP verification failed",
			);
		}

		// The backend confirms registration here — the welcome screen that follows
		// is UX only. Firing here (not at enterWithTokens) avoids counting the
		// welcome commit as a second event. Still anonymous; merged on identify.
		analytics.capture("user_signed_up");

		return response.accessToken;
	}

	/* ── Password reset. None of these enter the app —
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
			throw new ApiCodeError(response.code, response.message ?? "Reset code verification failed");
		}
	}

	public async resetPassword(request: ResetPasswordRequest): Promise<void> {
		const response = await authApi.resetPassword(request);
		if (response.success !== true) {
			throw new ApiCodeError(response.code, response.message ?? "Password reset failed");
		}
		analytics.capture("password_reset_completed");
	}

	/**
	 * Called by axios interceptor via AuthTokenBridge when a 401 happens.
	 * Must return a fresh access token string.
	 */
	public async refresh(): Promise<string> {
		let accessToken: string;
		try {
			({ accessToken } = await authApi.refresh());
		} catch (e) {
			runInAction(() => {
				this.refreshRefusedDeactivated = isDeactivated(e);
			});
			throw e;
		}

		runInAction(() => {
			this.refreshRefusedDeactivated = false;
			this.accessToken = accessToken;
			this.user = userFromAccessToken(accessToken);
			if (this.status !== "authenticated") {
				this.status = "authenticated";
			}
		});

		if (this.user) {
			analytics.identify(this.user);
		}

		return accessToken;
	}

	/**
	 * Calls API, clears state, resets other stores, then redirects to /login.
	 * `notice` says why when the app (not the user) ended the session.
	 */
	public async logout(notice: SignOutNotice | null = null): Promise<void> {
		// Capture while identity is still attached, then clear it — events after
		// reset() would be anonymous. Only for real sessions: the forced-logout
		// path can fire on an already-unauthenticated store.
		if (this.status === "authenticated") {
			analytics.capture("user_logged_out");
		}
		analytics.reset();

		this.loggingOut = true;
		try {
			await authApi.logout();
		} catch {
			// ignore network/logout errors; still clear local state
		} finally {
			runInAction(() => {
				this.loggingOut = false;
				this.accessToken = null;
				this.user = null;
				this.status = "unauthenticated";
				this.signOutNotice = notice;
				this.refreshRefusedDeactivated = false;
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
		// Several requests can fail at once; only the first ends an active session,
		// so the user is sent to /login once (auth-12).
		if (this.loggingOut || this.status !== "authenticated") {
			return;
		}
		// We intentionally don't await here to avoid blocking interceptor chains
		void this.logout(this.refreshRefusedDeactivated ? "deactivated" : "sessionEnded");
	}
}

export default AuthStore;
