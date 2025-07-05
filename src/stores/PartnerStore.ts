import { SortOrder } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreatePartnerRequest,
	GetPartnersRequest,
	Partner,
	PartnerType,
	UpdateParatnerRequest,
} from "models/partner";
import { Supply } from "models/supply";
import PartnerApi from "services/api/PartnerApi";

import { NotificationStore } from "./NotificationStore";

export type GetSuppliesRequest = {
	supplierId?: number;
	from?: Date;
	to?: Date;
	searchTerm?: string;
};

export interface IPartnerStore {
	allPartners: Loadable<Partner[]>;
	suppliers: Loadable<Partner[]>;
	customers: Loadable<Partner[]>;
	filteredPartners: Loadable<Partner[]>;
	selectedPartner: Partner | null;
	searchTerm: string;
	type: PartnerType;
	sortField: keyof Partner | null;
	sortOrder: SortOrder;

	// actions
	getAll(request?: GetPartnersRequest): Promise<void>;
	createSupplier(request: CreatePartnerRequest): Promise<void>;
	updateSupplier(request: UpdateParatnerRequest): Promise<void>;
	deleteSupplier(id: number): Promise<void>;

	// setters for filters & sorting
	setSearch(term: string): void;
	setType(type: PartnerType): void;
	setSelectedPartner(id: number): void;
	setSort(field: keyof Partner, order: SortOrder): void;
}

export class PartnerStore implements IPartnerStore {
	allPartners: Loadable<Partner[]> = [];
	supplies: Loadable<Supply[]> = [];
	selectedPartner: Partner | null = null;
	type: PartnerType = "All";
	searchTerm = "";
	sortField: keyof Partner | null = null;
	sortOrder: SortOrder = "asc";

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredPartners(): Loadable<Partner[]> {
		if (this.allPartners === "loading") {
			return "loading";
		}

		let partners = this.allPartners;
		const searchTerm = this.searchTerm?.toLocaleLowerCase();

		if (searchTerm) {
			partners = partners.filter(
				(el) =>
					el.name.toLowerCase().includes(searchTerm) ||
					el.address?.toLocaleLowerCase().includes(searchTerm) ||
					el.companyName?.toLocaleLowerCase().includes(searchTerm),
			);
		}

		if (this.type === "All") {
			return partners;
		}

		return partners.filter((el) => el.type === this.type || el.type === "All");
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

	async createSupplier(request: CreatePartnerRequest): Promise<void> {
		const result = await tryRun(() => PartnerApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.create"));
			return;
		}

		if (this.allPartners === "loading") {
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("partners.success.create"));

			if (this.allPartners !== "loading") {
				this.allPartners = [result.data, ...this.allPartners];
			}
		});
	}

	async updateSupplier(request: UpdateParatnerRequest): Promise<void> {
		const result = await tryRun(() => PartnerApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.update"));
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("partners.success.update"));

			if (this.allPartners !== "loading") {
				const index = this.allPartners.findIndex((s) => s.id === request.id);
				if (index !== -1) {
					this.allPartners[index] = result.data;
				}
			}
		});
	}

	async deleteSupplier(id: number): Promise<void> {
		const result = await tryRun(() => PartnerApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partners.errors.delete"));
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("partners.success.delete"));

			if (this.allPartners !== "loading") {
				this.allPartners = this.allPartners.filter((s) => s.id !== id);
			}
		});
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setType(type: PartnerType): void {
		this.type = type;
	}

	setSelectedPartner(id: number): void {
		if (this.allPartners === "loading") {
			return;
		}

		const partner = this.allPartners.find((p) => p.id === id);

		if (partner) {
			runInAction(() => (this.selectedPartner = partner));
		}
	}

	setSort(field: keyof Partner, order: SortOrder): void {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}
}
