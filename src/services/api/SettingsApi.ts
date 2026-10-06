import {
	ChangePasswordRequest,
	InviteUserRequest,
	Organization,
	TenantUser,
} from "../../models/settings";
import http from "./http";

/**
 * Settings API over the v1 contract (`/api/settings/*`): organization profile,
 * tenant users, and the per-user interface language. The organization PUT is
 * multipart/form-data (text fields + an optional `logo` file); invite is
 * phone-only (email → 400); language persists the current user's locale;
 * password changes the signed-in user's own password.
 */
class SettingsApi {
	private readonly base = "/api/settings";

	private readonly formHeaders = { headers: { "Content-Type": "multipart/form-data" } };

	async getOrganization(): Promise<Organization> {
		const { data } = await http.get<Organization>(`${this.base}/organization`);
		return data;
	}

	/**
	 * Update the organization profile. Sent as multipart/form-data: the text
	 * fields plus an optional `logo` file — a new file replaces the logo (the server
	 * returns its hosted `logoUrl`), and a profile whose `logoUrl` was cleared sends
	 * `removeLogo`; otherwise the existing logo is kept.
	 */
	async updateOrganization(org: Organization, logoFile?: File | null): Promise<Organization> {
		const form = new FormData();
		form.append("name", org.name);
		form.append("address", org.address ?? "");
		form.append("phone", org.phone ?? "");
		form.append("email", org.email ?? "");
		if (logoFile) {
			form.append("logo", logoFile, logoFile.name);
		} else if (!org.logoUrl) {
			form.append("removeLogo", "true");
		}

		const { data } = await http.put<Organization>(
			`${this.base}/organization`,
			form,
			this.formHeaders,
		);
		return data;
	}

	/** Persist the current user's interface language (the header globe). */
	async updateLanguage(language: string): Promise<void> {
		await http.put(`${this.base}/language`, { language });
	}

	/**
	 * The refresh-token cookie travels with the request (credentials are on for
	 * every call), which is how the server knows which session to keep signed in.
	 */
	async changePassword(request: ChangePasswordRequest): Promise<void> {
		await http.put(`${this.base}/password`, request);
	}

	async getUsers(): Promise<TenantUser[]> {
		const { data } = await http.get<TenantUser[]>(`${this.base}/users`);
		return data;
	}

	async inviteUser(request: InviteUserRequest): Promise<TenantUser> {
		const { data } = await http.post<TenantUser>(`${this.base}/users/invite`, request);
		return data;
	}

	async deactivateUser(id: number): Promise<TenantUser> {
		const { data } = await http.post<TenantUser>(`${this.base}/users/${id}/deactivate`);
		return data;
	}

	async reactivateUser(id: number): Promise<TenantUser> {
		const { data } = await http.post<TenantUser>(`${this.base}/users/${id}/reactivate`);
		return data;
	}
}

const settingsApi = new SettingsApi();
export default settingsApi;
