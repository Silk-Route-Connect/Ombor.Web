import { isReady, toLoadable } from "helpers/Loading";
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import {
	ChangePasswordRequest,
	InviteUserRequest,
	Organization,
	TenantUser,
} from "../models/settings";
import SettingsApi from "../services/api/SettingsApi";
import { ServerErrorHandler } from "../utils/formServerErrors";
import { NotificationStore } from "./NotificationStore";

export interface ISettingsStore {
	organization: Loadable<Organization | null>;
	users: Loadable<TenantUser[]>;
	saving: boolean;

	load(): Promise<void>;
	/** The business profile for documents (print header, debt reminder) — loaded once, kept current by saves. */
	ensureOrganization(): Promise<Loadable<Organization | null>>;
	saveOrganization(org: Organization, logoFile?: File | null): Promise<boolean>;
	updateLanguage(code: string): Promise<void>;
	inviting: boolean;
	changingPassword: boolean;
	/** The new user on success (the modal then explains how they sign in), null on failure. */
	inviteUser(
		request: InviteUserRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<TenantUser | null>;
	changePassword(
		request: ChangePasswordRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<boolean>;
	deactivateUser(user: TenantUser): Promise<void>;
	reactivateUser(user: TenantUser): Promise<void>;
}

/**
 * «Настройки» store — the organization profile and tenant users (mvp-plan §18).
 * Both are served by `/api/settings`. Interface language
 * is a client-side i18n preference and is handled in the page, not here. Users
 * are never deleted (rule 41) — they are deactivated / reactivated.
 */
export class SettingsStore implements ISettingsStore {
	private readonly notificationStore: NotificationStore;

	organization: Loadable<Organization | null> = "loading";
	users: Loadable<TenantUser[]> = "loading";
	saving = false;
	inviting = false;
	changingPassword = false;

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

		if (org.status === "fail") {
			this.notificationStore.notifyLoadError(org, "settings.error.load");
		} else if (users.status === "fail") {
			this.notificationStore.notifyLoadError(users, "settings.error.load");
		}

		runInAction(() => {
			this.organization = toLoadable(org);
			this.users = toLoadable(users);
		});
	}

	async ensureOrganization(): Promise<Loadable<Organization | null>> {
		if (isReady(this.organization)) {
			return this.organization;
		}
		runInAction(() => (this.organization = "loading"));

		const result = await tryRun(() => SettingsApi.getOrganization());
		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "settings.error.loadOrganization");
		}

		runInAction(() => (this.organization = toLoadable(result)));
		return this.organization;
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
			this.notificationStore.notifyApiError(result, "settings.error.save");
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
			this.notificationStore.notifyApiError(result, "settings.lang.saveError");
		}
	}

	async inviteUser(
		request: InviteUserRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<TenantUser | null> {
		if (this.inviting) {
			return null;
		}
		runInAction(() => (this.inviting = true));
		const result = await tryRun(() => SettingsApi.inviteUser(request));
		runInAction(() => (this.inviting = false));

		if (result.status === "fail") {
			if (!applyServerErrors?.(result.cause)) {
				this.notificationStore.notifyApiError(result, "settings.users.inviteError");
			}
			return null;
		}

		runInAction(() => {
			if (isReady(this.users)) {
				this.users = [...this.users, result.data];
			}
		});
		return result.data;
	}

	/** On success every other device is signed out at its next refresh; this one stays in. */
	async changePassword(
		request: ChangePasswordRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<boolean> {
		if (this.changingPassword) {
			return false;
		}
		runInAction(() => (this.changingPassword = true));
		const result = await tryRun(() => SettingsApi.changePassword(request));
		runInAction(() => (this.changingPassword = false));

		if (result.status === "fail") {
			if (!applyServerErrors?.(result.cause)) {
				this.notificationStore.notifyApiError(result, "settings.security.error");
			}
			return false;
		}
		this.notificationStore.success(i18next.t("settings.security.changed"));
		return true;
	}

	async deactivateUser(user: TenantUser): Promise<void> {
		const result = await tryRun(() => SettingsApi.deactivateUser(user.id));
		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "settings.users.statusError");
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
			this.notificationStore.notifyApiError(result, "settings.users.statusError");
			return;
		}
		this.replaceUser(result.data);
		this.notificationStore.success(
			i18next.t("settings.users.reactivatedToast", { name: user.name }),
		);
	}

	private replaceUser(updated: TenantUser): void {
		runInAction(() => {
			if (isReady(this.users)) {
				this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
			}
		});
	}
}

export default SettingsStore;
