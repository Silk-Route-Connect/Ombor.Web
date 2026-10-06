import { Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { Product, ProductMovement, ProductTransaction } from "models/product";
import ProductApi from "services/api/ProductApi";

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
	private readonly loads = new LoadSequence();

	product: Loadable<Product | null> = "loading";
	transactions: Loadable<ProductTransaction[]> = "loading";
	movements: Loadable<ProductMovement[]> = "loading";

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(productId: number): Promise<void> {
		const isCurrent = this.loads.begin();
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
		if (!isCurrent()) {
			return;
		}

		runInAction(() => {
			this.product = toDetailLoadable(product);
			this.transactions = toLoadable(transactions);
			this.movements = toLoadable(movements);
		});
	}

	applyProduct(product: Product): void {
		this.product = product;
	}

	clear(): void {
		this.loads.invalidate();
		this.product = "loading";
		this.transactions = "loading";
		this.movements = "loading";
	}
}

export default SelectedProductStore;
