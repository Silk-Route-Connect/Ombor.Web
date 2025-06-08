import { makeAutoObservable, runInAction } from "mobx";
import supplyApi from "services/api/SupplyApi";

import { Loadable, tryRun } from "../helpers/helpers";
import { CreateSupplyRequest, Supply, UpdateSupplyRequest } from "../models/supply";
import { NotificationStore } from "./NotificationStore";
import { GetSuppliesRequest } from "./SupplierStore";

export interface ISupplyStore {
	allSupplies: Loadable<Supply[]>;
	filteredSupplies: Loadable<Supply[]>;
	setSearch(term: string): void;
	loadSupplies(supplierId?: number, fromDate?: Date, toDate?: Date): Promise<void>;
	createSupply(supply: CreateSupplyRequest): Promise<void>;
	updateSupply(supply: UpdateSupplyRequest): Promise<void>;
	deleteSupply(id: number): Promise<void>;
}

export class SupplyStore implements ISupplyStore {
	private readonly notificationStore: NotificationStore;
	allSupplies: Loadable<Supply[]> = [];
	searchTerm = "";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredSupplies(): Loadable<Supply[]> {
		return this.allSupplies;
	}

	setSearch(term: string): void {
		runInAction(() => (this.searchTerm = term));
	}

	async loadSupplies(supplierId?: number, fromDate?: Date, toDate?: Date): Promise<void> {
		if (this.allSupplies === "loading") {
			return;
		}

		runInAction(() => (this.allSupplies = "loading"));

		const request: GetSuppliesRequest = { supplierId, from: fromDate, to: toDate };
		const result = await tryRun(() => supplyApi.getAll(request));

		if (result.status === "fail") {
			this.notificationStore.error("Failed to load supplies");
			runInAction(() => (this.allSupplies = []));
			return;
		}

		runInAction(() => (this.allSupplies = result.data));
	}

	async createSupply(supply: CreateSupplyRequest): Promise<void> {
		console.log("Creating supply:", supply);
		// Implementation for creating a supply
	}

	async updateSupply(supply: UpdateSupplyRequest): Promise<void> {
		console.log("Updating supply:", supply);
		// Implementation for updating a supply
	}

	async deleteSupply(id: number): Promise<void> {
		console.log("Deleting supply with ID:", id);
		// Implementation for deleting a supply
	}

	async getSupplyById(id: number): Promise<Supply | null> {
		console.log("Fetching supply by ID:", id);
		// Implementation for fetching a supply by ID
		return null; // Placeholder return
	}
}
