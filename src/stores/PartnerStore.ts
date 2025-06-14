import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreatePartnerRequest,
	GetPartnersRequest,
	Partner,
	UpdateParatnerRequest,
} from "models/partner";
import { Supply } from "models/supply";
import SupplierApi from "services/api/PartnerApi";

import { NotificationStore } from "./NotificationStore";

export type GetSuppliesRequest = {
	supplierId?: number;
	from?: Date;
	to?: Date;
	searchTerm?: string;
};

export interface IPartnerStore {
	allSuppliers: Loadable<Partner[]>;
	supplies: Loadable<Supply[]>;
	searchTerm: string;
	filteredSuppliers: Loadable<Partner[]>;

	loadSuppliers(request?: GetPartnersRequest): Promise<void>;
	loadSupplies(request?: GetSuppliesRequest): Promise<void>;
	setSearch(term: string): void;
	createSupplier(request: CreatePartnerRequest): Promise<void>;
	updateSupplier(request: UpdateParatnerRequest): Promise<void>;
	deleteSupplier(id: number): Promise<void>;
}

export class PartnerStore implements IPartnerStore {
	allSuppliers: Loadable<Partner[]> = [];
	supplies: Loadable<Supply[]> = [];
	searchTerm = "";

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredSuppliers(): Loadable<Partner[]> {
		if (this.allSuppliers === "loading") {
			return "loading";
		}

		return this.allSuppliers.filter((s) =>
			s.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
		);
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	async loadSuppliers(request?: GetPartnersRequest | null): Promise<void> {
		runInAction(() => (this.allSuppliers = "loading"));

		const result = await tryRun(() => SupplierApi.getAll(request));
		if (result.status === "fail") {
			this.notificationStore.error("Failed to load suppliers");
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allSuppliers = data));
	}

	async loadSupplies(request?: GetSuppliesRequest): Promise<void> {
		console.warn("loadSupplies is not implemented in SupplierStore");
		this.supplies = "loading";

		const result = await tryRun(() => SupplierApi.getSupplies(request));

		if (result.status === "fail") {
			this.notificationStore.error("Failed to load supplies");
			return;
		}

		runInAction(() => (this.supplies = result.data));
	}

	async createSupplier(request: CreatePartnerRequest): Promise<void> {
		const result = await tryRun(() => SupplierApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error("Failed to create supplier");
			return;
		}

		if (this.allSuppliers === "loading") {
			return;
		}

		runInAction(() => {
			this.notificationStore.success("Supplier created successfully");

			if (this.allSuppliers !== "loading") {
				this.allSuppliers = [result.data, ...this.allSuppliers];
			}
		});
	}

	async updateSupplier(request: UpdateParatnerRequest): Promise<void> {
		const result = await tryRun(() => SupplierApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error("Failed to update supplier");
			return;
		}

		runInAction(() => {
			this.notificationStore.success("Supplier updated successfully");

			if (this.allSuppliers !== "loading") {
				const index = this.allSuppliers.findIndex((s) => s.id === request.id);
				if (index !== -1) {
					this.allSuppliers[index] = result.data;
				}
			}
		});
	}

	async deleteSupplier(id: number): Promise<void> {
		const result = await tryRun(() => SupplierApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error("Failed to delete supplier");
			return;
		}

		runInAction(() => {
			this.notificationStore.success("Supplier deleted successfully");

			if (this.allSuppliers !== "loading") {
				this.allSuppliers = this.allSuppliers.filter((s) => s.id !== id);
			}
		});
	}
}
