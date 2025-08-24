import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Product, ProductTransaction } from "models/product";
import ProductApi from "services/api/ProductApi";
import { DateFilter, PresetOption } from "utils/dateFilterUtils";
import { isWithinDateRange } from "utils/dateUtils";

import { NotificationStore } from "./NotificationStore";
import { IProductStore } from "./ProductStore";

export interface ISelectedProductStore {
	sales: Loadable<ProductTransaction[]>;
	saleRefunds: Loadable<ProductTransaction[]>;
	supplies: Loadable<ProductTransaction[]>;
	supplyRefunds: Loadable<ProductTransaction[]>;

	readonly dateFilter: DateFilter;

	// setters for filters & sorting
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

export class SelectedProductStore implements ISelectedProductStore {
	private selectedProduct: Product | null = null;
	private readonly productStore: IProductStore;
	private readonly notificationStore: NotificationStore;

	private allTransactions: Loadable<ProductTransaction[]> = [];

	dateFilter: DateFilter = { type: "preset", preset: "week" };

	constructor(productStore: IProductStore, notificationStore: NotificationStore) {
		this.productStore = productStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get sales(): Loadable<ProductTransaction[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const sales = this.allTransactions.filter((el) => el.transactionType === "Sale");

		return this.applyFilter(sales);
	}

	get supplies(): Loadable<ProductTransaction[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const supplies = this.allTransactions.filter((el) => el.transactionType === "Supply");

		return this.applyFilter(supplies);
	}

	get saleRefunds(): Loadable<ProductTransaction[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const saleRefunds = this.allTransactions.filter((el) => el.transactionType === "SaleRefund");

		return this.applyFilter(saleRefunds);
	}

	get supplyRefunds(): Loadable<ProductTransaction[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const supplyRefunds = this.allTransactions.filter(
			(el) => el.transactionType === "SupplyRefund",
		);

		return this.applyFilter(supplyRefunds);
	}

	setPreset(preset: PresetOption) {
		this.dateFilter = { type: "preset", preset };
	}

	setCustom(from: Date, to: Date) {
		this.dateFilter = { type: "custom", from, to };
	}

	private applyFilter(data: Loadable<ProductTransaction[]>): ProductTransaction[] {
		if (data === "loading") {
			return [];
		}

		return data.filter((el) => isWithinDateRange(el.date, this.dateFilter));
	}

	private async getProductTransactions(): Promise<void> {
		if (this.allTransactions === "loading") {
			return;
		}

		const productId = this.selectedProduct?.id;
		if (!productId) {
			return;
		}

		const result = await tryRun(() => ProductApi.getTransactions(productId));

		if (result.status === "fail") {
			this.notificationStore.error("product.error.getTransactions");
		}

		const data = result.status === "fail" ? [] : result.data;

		runInAction(() => (this.allTransactions = data));
	}

	private registerReactions() {
		reaction(
			() => this.productStore.selectedProduct,
			(product) => {
				runInAction(() => {
					this.allTransactions = [];
					this.dateFilter = { type: "preset", preset: "week" };
				});

				if (product) {
					this.selectedProduct = product;
					this.getProductTransactions();
				}
			},
		);
	}
}
