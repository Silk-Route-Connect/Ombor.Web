import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { Inventory, InventoryItem } from "../models/inventory";
import inventoryApi from "../services/api/InventoryApi";
import { NotificationStore } from "./NotificationStore";

export interface IInventoryStore {
	/* state */
	inventories: Loadable<Inventory[]>;
	itemsByInventory: Map<number, Loadable<InventoryItem[]>>;
	selectedInventory: Inventory | null;
	selectedItems: Loadable<InventoryItem[]>;

	/* actions */
	getAll(): Promise<void>;
	setSelectedInventory(inventoryId: number | null): Promise<void>;
	stockOf(productId: number): number | null;
}

export class InventoryStore implements IInventoryStore {
	inventories: Loadable<Inventory[]> = [];
	/**  key = inventoryId → InventoryItem[] | "loading" */
	itemsByInventory = new Map<number, Loadable<InventoryItem[]>>();
	selectedInventory: Inventory | null = null;

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this);
	}

	get selectedItems(): Loadable<InventoryItem[]> {
		if (this.selectedInventory == null) {
			return [];
		}

		return this.itemsByInventory.get(this.selectedInventory.id) ?? [];
	}

	async getAll(): Promise<void> {
		if (this.inventories === "loading") return;

		runInAction(() => (this.inventories = "loading"));

		const result = await tryRun(() => inventoryApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("inventory.error.getAll") + `: ${result.error}`);
			runInAction(() => (this.inventories = []));
			return;
		}

		runInAction(() => (this.inventories = result.data));
	}

	async setSelectedInventory(inventoryId: number | null): Promise<void> {
		if (this.inventories === "loading") {
			return;
		}

		if (!inventoryId) {
			this.selectedInventory = null;
			return;
		}

		const cached = this.itemsByInventory.get(inventoryId);
		if (cached && cached !== "loading") {
			return;
		}

		runInAction(() => this.itemsByInventory.set(inventoryId, "loading"));

		const result = await tryRun(() => inventoryApi.getItems(inventoryId));

		if (result.status === "fail") {
			this.notificationStore.error(`${translate("inventory.error.getItems")}: ${result.error}`);
			runInAction(() => this.itemsByInventory.set(inventoryId, []));
			return;
		}

		runInAction(() => this.itemsByInventory.set(inventoryId, result.data));
	}

	stockOf(productId: number): number | null {
		if (this.selectedInventory == null) {
			return null;
		}

		const items = this.itemsByInventory.get(this.selectedInventory.id);
		if (!items || items === "loading") {
			return null;
		}

		return items.find((item) => item.productId === productId)?.quantityInStock ?? 0;
	}
}

export default InventoryStore;
