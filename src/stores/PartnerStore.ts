import { isReady, Loadable, toLoadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { CreatePartnerRequest, Partner, UpdatePartnerRequest } from "models/partner";
import PartnerApi from "services/api/PartnerApi";
import { matchesSearch } from "utils/stringUtils";

import { NotificationStore } from "./NotificationStore";

export type PartnerTypeFilter = "All" | "Customer" | "Supplier";

export type PartnerDialogMode =
	| { kind: "form"; partner?: Partner }
	| { kind: "archive"; partner: Partner }
	| { kind: "restore"; partner: Partner }
	| { kind: "delete"; partner: Partner }
	| { kind: "cannotDelete"; partner: Partner }
	| { kind: "none" };

export interface IPartnerStore {
	allPartners: Loadable<Partner[]>;
	filteredPartners: Loadable<Partner[]>;
	/** Active (non-archived) partners selectable in pickers — Customer or Both. */
	customers: Loadable<Partner[]>;
	/** Active (non-archived) partners selectable in pickers — Supplier or Both. */
	suppliers: Loadable<Partner[]>;
	/** Active (non-archived) partners. */
	activeCount: number;
	archivedCount: number;

	searchTerm: string;
	typeFilter: PartnerTypeFilter;
	showArchived: boolean;
	isSaving: boolean;
	dialogMode: PartnerDialogMode;

	getAll(): Promise<void>;
	/** The created partner, or null when the create failed (already toasted). */
	create(request: CreatePartnerRequest): Promise<Partner | null>;
	update(request: UpdatePartnerRequest): Promise<Partner | null>;
	archive(partner: Partner): Promise<Partner | null>;
	restore(partner: Partner): Promise<Partner | null>;
	remove(partner: Partner): Promise<boolean>;

	setSearch(term: string): void;
	setTypeFilter(type: PartnerTypeFilter): void;
	setShowArchived(show: boolean): void;

	openCreate(): void;
	openEdit(partner: Partner): void;
	openArchive(partner: Partner): void;
	openRestore(partner: Partner): void;
	openDelete(partner: Partner): void;
	openCannotDelete(partner: Partner): void;
	closeDialog(): void;
}

export class PartnerStore implements IPartnerStore {
	private readonly notificationStore: NotificationStore;

	allPartners: Loadable<Partner[]> = "loading";
	searchTerm = "";
	typeFilter: PartnerTypeFilter = "All";
	showArchived = false;
	isSaving = false;
	dialogMode: PartnerDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get archivedCount(): number {
		if (!isReady(this.allPartners)) {
			return 0;
		}
		return this.allPartners.filter((p) => p.isArchived).length;
	}

	get filteredPartners(): Loadable<Partner[]> {
		if (!isReady(this.allPartners)) {
			return this.allPartners;
		}

		// «Активные | Архив» segmented view: each side shows only its set (the
		// «Архив» view swaps to archived-only — DSN-2 — not active + archived).
		let partners = this.allPartners.filter((p) =>
			this.showArchived ? p.isArchived : !p.isArchived,
		);

		if (this.searchTerm.trim()) {
			partners = partners.filter(
				(p) =>
					matchesSearch(p.name, this.searchTerm) ||
					matchesSearch(p.companyName, this.searchTerm) ||
					p.phoneNumbers.some((phone) => matchesSearch(phone, this.searchTerm)),
			);
		}

		if (this.typeFilter === "Customer") {
			partners = partners.filter((p) => p.type === "Customer" || p.type === "Both");
		} else if (this.typeFilter === "Supplier") {
			partners = partners.filter((p) => p.type === "Supplier" || p.type === "Both");
		}

		return partners;
	}

	get customers(): Loadable<Partner[]> {
		if (!isReady(this.allPartners)) {
			return this.allPartners;
		}
		return this.allPartners.filter((p) => !p.isArchived && p.type !== "Supplier");
	}

	get suppliers(): Loadable<Partner[]> {
		if (!isReady(this.allPartners)) {
			return this.allPartners;
		}
		return this.allPartners.filter((p) => !p.isArchived && p.type !== "Customer");
	}

	/** The debt totals of the summary strip are served (`DebtStore.summary`), never summed here (rule 8). */
	get activeCount(): number {
		return isReady(this.allPartners) ? this.allPartners.filter((p) => !p.isArchived).length : 0;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allPartners = "loading"));

		const result = await tryRun(() => PartnerApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "partner.error.getAll");
		}

		runInAction(() => (this.allPartners = toLoadable(result)));
	}

	async create(request: CreatePartnerRequest): Promise<Partner | null> {
		const result = await withSaving(this, () => PartnerApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "partner.error.create");
			return null;
		}

		runInAction(() => {
			if (isReady(this.allPartners)) {
				this.allPartners = [result.data, ...this.allPartners];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("partner.success.create", { name: result.data.name }));
		return result.data;
	}

	async update(request: UpdatePartnerRequest): Promise<Partner | null> {
		const result = await withSaving(this, () => PartnerApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "partner.error.update");
			return null;
		}

		this.replacePartner(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("partner.success.update"));
		return result.data;
	}

	async archive(partner: Partner): Promise<Partner | null> {
		const result = await withSaving(this, () => PartnerApi.archive(partner.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "partner.error.archive");
			return null;
		}

		// Backend returns 204 — refetch the updated partner to refresh the row.
		const updated = await this.refreshPartner(partner.id);
		this.closeDialog();
		this.notificationStore.success(i18next.t("partner.success.archive", { name: partner.name }));
		return updated;
	}

	async restore(partner: Partner): Promise<Partner | null> {
		const result = await withSaving(this, () => PartnerApi.restore(partner.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "partner.error.restore");
			return null;
		}

		const updated = await this.refreshPartner(partner.id);
		this.closeDialog();
		this.notificationStore.success(i18next.t("partner.success.restore", { name: partner.name }));
		return updated;
	}

	async remove(partner: Partner): Promise<boolean> {
		const result = await withSaving(this, () => PartnerApi.delete(partner.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "partner.error.delete");
			return false;
		}

		runInAction(() => {
			if (isReady(this.allPartners)) {
				this.allPartners = this.allPartners.filter((p) => p.id !== partner.id);
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("partner.success.delete", { name: partner.name }));
		return true;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setTypeFilter(type: PartnerTypeFilter): void {
		this.typeFilter = type;
	}

	setShowArchived(show: boolean): void {
		this.showArchived = show;
	}

	openCreate(): void {
		this.dialogMode = { kind: "form" };
	}

	openEdit(partner: Partner): void {
		this.dialogMode = { kind: "form", partner };
	}

	openArchive(partner: Partner): void {
		this.dialogMode = { kind: "archive", partner };
	}

	openRestore(partner: Partner): void {
		this.dialogMode = { kind: "restore", partner };
	}

	openDelete(partner: Partner): void {
		this.dialogMode = { kind: "delete", partner };
	}

	openCannotDelete(partner: Partner): void {
		this.dialogMode = { kind: "cannotDelete", partner };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	/** Refetch a single partner (after a 204 mutation) and update the row in place. */
	private async refreshPartner(id: number): Promise<Partner | null> {
		const result = await tryRun(() => PartnerApi.getById(id));
		const updated = result.status === "success" ? result.data : null;
		if (updated) {
			this.replacePartner(updated);
		}
		return updated;
	}

	private replacePartner(updated: Partner): void {
		runInAction(() => {
			if (isReady(this.allPartners)) {
				this.allPartners = this.allPartners.map((p) => (p.id === updated.id ? updated : p));
			}
		});
	}
}
