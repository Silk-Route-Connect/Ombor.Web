import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateSupplierRequest,
	GetSuppliersRequest,
	Supplier,
	UpdateSupplierRequest,
} from "models/supplier";
import SupplierApi from "services/api/SupplierApi";

import { NotificationStore } from "./NotificationStore";

export interface ISupplierStore {
	allSuppliers: Loadable<Supplier[]>;
	searchTerm: string;
	filteredSuppliers: Loadable<Supplier[]>;

	setSearch(term: string): void;
	loadSuppliers(request?: GetSuppliersRequest): Promise<void>;
	createSupplier(request: CreateSupplierRequest): Promise<void>;
	updateSupplier(request: UpdateSupplierRequest): Promise<void>;
	deleteSupplier(id: number): Promise<void>;
}

export class SupplierStore implements ISupplierStore {
	allSuppliers: Loadable<Supplier[]> = [];
	searchTerm = "";

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredSuppliers(): Loadable<Supplier[]> {
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

	async loadSuppliers(request?: GetSuppliersRequest | null): Promise<void> {
		runInAction(() => (this.allSuppliers = "loading"));

		const result = await tryRun(() => SupplierApi.getAll(request));
		if (result.status === "fail") {
			this.notificationStore.error("Failed to load suppliers");
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allSuppliers = data));
	}

	async createSupplier(request: CreateSupplierRequest): Promise<void> {
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

	async updateSupplier(request: UpdateSupplierRequest): Promise<void> {
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
