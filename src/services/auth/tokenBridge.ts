export type GetAccessToken = () => string | null;
export type RefreshAccessToken = () => Promise<string>;
export type OnLogout = (reason: "refresh_failed" | "unauthorized") => void;

let getAccessToken: GetAccessToken = () => null;
let refreshAccessToken: RefreshAccessToken | null = null;
let onLogout: OnLogout = () => {};

export const AuthTokenBridge = {
	registerGetAccessToken(fn: GetAccessToken) {
		getAccessToken = fn;
	},

	registerRefreshAccessToken(fn: RefreshAccessToken) {
		refreshAccessToken = fn;
	},

	registerOnLogout(fn: OnLogout) {
		onLogout = fn;
	},

	getAccessToken(): string | null {
		return getAccessToken();
	},

	async refreshAccessToken(): Promise<string> {
		if (!refreshAccessToken) {
			throw new Error("Refresh handler is not registered.");
		}

		return refreshAccessToken();
	},

	onLogout(reason: "refresh_failed" | "unauthorized") {
		onLogout(reason);
	},
};
