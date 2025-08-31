import { SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreatePartnerRequest,
	GetPartnersRequest,
	Partner,
	PartnerType,
	UpdatePartnerRequest,
} from "models/partner";
import PartnerApi from "services/api/PartnerApi";

import { NotificationStore } from "./NotificationStore";

export type PartnerTypeFilters = PartnerType | "All";

export type DialogMode =
	| { kind: "form"; partner?: Partner }
	| { kind: "delete"; partner: Partner }
	| { kind: "details"; partner: Partner }
	| { kind: "none" };

export interface IPartnerStore {
	// computed properties
	allPartners: Loadable<Partner[]>;
	filteredPartners: Loadable<Partner[]>;
	suppliers: Loadable<Partner[]>;
	customers: Loadable<Partner[]>;

	// UI state
	selectedPartner: Partner | null;
	searchTerm: string;
	type: PartnerTypeFilters;
	sortField: keyof Partner | null;
	sortOrder: SortOrder;
	isSaving: boolean;
	dialogMode: DialogMode;

	// actions
	getAll(request?: GetPartnersRequest): Promise<void>;
	create(request: CreatePartnerRequest): Promise<void>;
	update(request: UpdatePartnerRequest): Promise<void>;
	delete(partnerId: number): Promise<void>;

	// setters for filters & sorting
	setSearch(term: string): void;
	setTypeFilter(type: PartnerTypeFilters): void;
	setSelectedPartner(partnerId?: number | null): void;
	setSort(field: keyof Partner, order: SortOrder): void;

	// UI dialog helper methods
	openCreate(): void;
	openEdit(partner: Partner): void;
	openDelete(partner: Partner): void;
	openDetails(partner: Partner): void;
	closeDialog(): void;
}

export class PartnerStore implements IPartnerStore {
	allPartners: Loadable<Partner[]> = [];
	selectedPartner: Partner | null = null;
	searchTerm = "";
	type: PartnerTypeFilters = "All";
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;
	sortField: keyof Partner | null = null;
	sortOrder: SortOrder = "asc";

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredPartners(): Loadable<Partner[]> {
		if (this.allPartners === "loading") {
			return "loading";
		}

		let filteredPartners = this.allPartners;
		const searchTerm = this.searchTerm?.toLowerCase();

		if (searchTerm) {
			filteredPartners = filteredPartners.filter(
				(el) =>
					el.name.toLowerCase().includes(searchTerm) ||
					el.address?.toLowerCase().includes(searchTerm) ||
					el.companyName?.toLowerCase().includes(searchTerm),
			);
		}

		if (this.type === "All") {
			return filteredPartners;
		}

		return filteredPartners.filter((el) => el.type === this.type);
	}

	get suppliers(): Loadable<Partner[]> {
		if (this.allPartners === "loading") {
			return "loading";
		}

		return this.allPartners.filter((el) => el.type !== "Customer");
	}

	get customers(): Loadable<Partner[]> {
		if (this.allPartners === "loading") {
			return "loading";
		}

		return this.allPartners.filter((el) => el.type !== "Supplier");
	}

	async getAll(request?: GetPartnersRequest | null): Promise<void> {
		if (this.allPartners === "loading") {
			return;
		}

		runInAction(() => (this.allPartners = "loading"));

		const result = await tryRun(() => PartnerApi.getAll(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.getAll"));
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allPartners = data));
	}

	async create(request: CreatePartnerRequest): Promise<void> {
		const result = await withSaving(this, () => PartnerApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.create"));
			return;
		}

		runInAction(() => {
			if (this.allPartners !== "loading") {
				this.allPartners = [result.data, ...this.allPartners];
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("partners.success.create"));
	}

	async update(request: UpdatePartnerRequest): Promise<void> {
		const result = await withSaving(this, () => PartnerApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.update"));
			return;
		}

		runInAction(() => {
			if (this.allPartners !== "loading") {
				this.allPartners = this.allPartners.map((el) =>
					el.id === result.data.id ? result.data : el,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("partners.success.update"));
	}

	async delete(id: number): Promise<void> {
		const result = await withSaving(this, () => PartnerApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.delete"));
			return;
		}

		runInAction(() => {
			if (this.allPartners !== "loading") {
				this.allPartners = this.allPartners.filter((s) => s.id !== id);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("partners.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setTypeFilter(type: PartnerTypeFilters): void {
		this.type = type;
	}

	setSelectedPartner(partnerId?: number | null): void {
		if (this.allPartners === "loading") {
			return;
		}

		if (!partnerId) {
			runInAction(() => (this.selectedPartner = null));
			return;
		}

		const partner = this.allPartners.find((p) => p.id === partnerId);

		if (partner) {
			runInAction(() => (this.selectedPartner = partner));
		}
	}

	setSort(field: keyof Partner, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(partner: Partner): void {
		this.setDialog({ kind: "form", partner: partner });
	}

	openDelete(partner: Partner): void {
		this.setDialog({ kind: "delete", partner: partner });
	}

	openDetails(partner: Partner): void {
		this.setDialog({ kind: "details", partner: partner });
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		const partner = "partner" in mode ? (mode.partner ?? null) : null;

		this.dialogMode = mode;
		this.selectedPartner = partner;
	}
}
