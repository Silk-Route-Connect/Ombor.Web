import { InviteUserRequest, Organization, TenantUser } from "../../models/settings";
import http from "./http";

/**
 * Settings API over the target v1 contract (`/api/settings/*`). The organization
 * profile and user management are mocked (docs/mocking.md) — no backend endpoints
 * exist yet (only /api/auth/*). Interface language is a client-side i18n
 * preference and is not part of this API.
 */
class SettingsApi {
	private readonly base = "/api/settings";

	async getOrganization(): Promise<Organization> {
		const { data } = await http.get<Organization>(`${this.base}/organization`);
		return data;
	}

	async updateOrganization(org: Organization): Promise<Organization> {
		const { data } = await http.put<Organization>(`${this.base}/organization`, org);
		return data;
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
