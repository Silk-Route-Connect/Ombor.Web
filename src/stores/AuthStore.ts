import { makeAutoObservable, runInAction } from "mobx";
import { LoginRequest, RegisterRequest, VerifyPhoneRequest } from "models/auth";
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

	public async login(request: LoginRequest): Promise<void> {
		const result = await authApi.login(request);

		runInAction(() => {
			this.accessToken = result.accessToken;
			this.status = "authenticated";
		});

		if (this.sideEffects.onRedirectToApp) {
			this.sideEffects.onRedirectToApp();
		}
	}

	/**
	 * Register: server sends OTP; UI should navigate to OTP step.
	 * Returns server response (e.g., message, expiresInMinutes) for UI feedback.
	 */
	public async register(request: RegisterRequest) {
		return authApi.register(request);
	}

	/**
	 * Verify phone: on success backend returns tokens and sets refresh cookie.
	 * We store access token and enter the app.
	 */
	public async verifyPhone(request: VerifyPhoneRequest): Promise<void> {
		const response = await authApi.verifyPhone(request);

		if (response.success !== true) {
			throw new Error(response.message ?? "OTP verification failed");
		}

		runInAction(() => {
			this.accessToken = response.accessToken;
			this.status = "authenticated";
		});

		if (this.sideEffects.onRedirectToApp) {
			this.sideEffects.onRedirectToApp();
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
