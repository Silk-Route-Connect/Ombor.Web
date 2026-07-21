import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { InviteUserRequest, Organization, TenantUser } from "../models/settings";
import SettingsApi from "../services/api/SettingsApi";
import { NotificationStore } from "./NotificationStore";

export interface ISettingsStore {
	organization: Loadable<Organization | null>;
	users: Loadable<TenantUser[]>;
	saving: boolean;

	load(): Promise<void>;
	saveOrganization(org: Organization, logoFile?: File | null): Promise<boolean>;
	updateLanguage(code: string): Promise<void>;
	inviteUser(request: InviteUserRequest): Promise<boolean>;
	deactivateUser(user: TenantUser): Promise<void>;
	reactivateUser(user: TenantUser): Promise<void>;
}

/**
 * «Настройки» store — the organization profile and tenant users (mvp-plan §18).
 * Both are mocked at the target v1 contract (no backend yet). Interface language
 * is a client-side i18n preference and is handled in the page, not here. Users
 * are never deleted (rule 41) — they are deactivated / reactivated.
 */
export class SettingsStore implements ISettingsStore {
	private readonly notificationStore: NotificationStore;

	organization: Loadable<Organization | null> = "loading";
	users: Loadable<TenantUser[]> = "loading";
	saving = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(): Promise<void> {
		runInAction(() => {
			this.organization = "loading";
			this.users = "loading";
		});

		const [org, users] = await Promise.all([
			tryRun(() => SettingsApi.getOrganization()),
			tryRun(() => SettingsApi.getUsers()),
		]);

		if (org.status === "fail" || users.status === "fail") {
			this.notificationStore.error(i18next.t("settings.error.load"));
		}

		runInAction(() => {
			this.organization = org.status === "success" ? org.data : null;
			this.users = users.status === "success" ? users.data : [];
		});
	}

	async saveOrganization(org: Organization, logoFile?: File | null): Promise<boolean> {
		runInAction(() => (this.saving = true));

		const result = await tryRun(() => SettingsApi.updateOrganization(org, logoFile));

		runInAction(() => {
			this.saving = false;
			if (result.status === "success") {
				this.organization = result.data;
			}
		});

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("settings.error.save"));
			return false;
		}
		this.notificationStore.success(i18next.t("settings.saved"));
		return true;
	}

	/**
	 * Persist the per-user interface language. The i18n locale already changed in
	 * the UI; this records it on the server (the header globe). The backend enum is
	 * ru | uz-Latn | uz-Cyrl, so the app's "uz" maps to "uz-Latn".
	 */
	async updateLanguage(code: string): Promise<void> {
		const language = code === "uz" ? "uz-Latn" : code;
		const result = await tryRun(() => SettingsApi.updateLanguage(language));
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("settings.lang.saveError"));
		}
	}

	async inviteUser(request: InviteUserRequest): Promise<boolean> {
		const result = await tryRun(() => SettingsApi.inviteUser(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("settings.users.inviteError"));
			return false;
		}

		runInAction(() => {
			if (this.users !== "loading") {
				this.users = [...this.users, result.data];
			}
		});
		this.notificationStore.success(i18next.t("settings.users.inviteSent"));
		return true;
	}

	async deactivateUser(user: TenantUser): Promise<void> {
		const result = await tryRun(() => SettingsApi.deactivateUser(user.id));
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("settings.users.statusError"));
			return;
		}
		this.replaceUser(result.data);
		this.notificationStore.success(
			i18next.t("settings.users.deactivatedToast", { name: user.name }),
		);
	}

	async reactivateUser(user: TenantUser): Promise<void> {
		const result = await tryRun(() => SettingsApi.reactivateUser(user.id));
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("settings.users.statusError"));
			return;
		}
		this.replaceUser(result.data);
		this.notificationStore.success(
			i18next.t("settings.users.reactivatedToast", { name: user.name }),
		);
	}

	private replaceUser(updated: TenantUser): void {
		runInAction(() => {
			if (this.users !== "loading") {
				this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
			}
		});
	}
}

export default SettingsStore;
