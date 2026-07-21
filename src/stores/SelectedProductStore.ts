import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Product, ProductMovement, ProductTransaction } from "models/product";
import ProductApi from "services/api/ProductApi";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedProductStore {
	product: Loadable<Product | null>;
	transactions: Loadable<ProductTransaction[]>;
	movements: Loadable<ProductMovement[]>;

	load(productId: number): Promise<void>;
	/** Reflect a successful edit/archive/restore without a full reload. */
	applyProduct(product: Product): void;
	clear(): void;
}

/**
 * State for the routed product detail page: the open product plus its child
 * collections (transaction history and the warehouse movements ledger),
 * loaded explicitly by id when the route mounts.
 */
export class SelectedProductStore implements ISelectedProductStore {
	private readonly notificationStore: NotificationStore;

	product: Loadable<Product | null> = "loading";
	transactions: Loadable<ProductTransaction[]> = "loading";
	movements: Loadable<ProductMovement[]> = "loading";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(productId: number): Promise<void> {
		runInAction(() => {
			this.product = "loading";
			this.transactions = "loading";
			this.movements = "loading";
		});

		const [product, transactions, movements] = await Promise.all([
			tryRun(() => ProductApi.getById(productId)),
			tryRun(() => ProductApi.getTransactions(productId)),
			tryRun(() => ProductApi.getMovements(productId)),
		]);

		if (product.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.getById"));
		} else if (transactions.status === "fail" || movements.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.getTransactions"));
		}

		runInAction(() => {
			this.product = product.status === "success" ? product.data : null;
			this.transactions = transactions.status === "success" ? transactions.data : [];
			this.movements = movements.status === "success" ? movements.data : [];
		});
	}

	applyProduct(product: Product): void {
		this.product = product;
	}

	clear(): void {
		this.product = "loading";
		this.transactions = "loading";
		this.movements = "loading";
	}
}

export default SelectedProductStore;
