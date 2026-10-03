import { isReady, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { Category } from "models/category";
import { ServerErrorHandler } from "utils/formServerErrors";
import {
	matchesProductSearch,
	matchesStockFilter,
	matchesType,
	productStockLevel,
	ProductTypeFilter,
	StockFilter,
} from "utils/productFilters";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { CreateProductRequest, Product, UpdateProductRequest } from "../models/product";
import ProductApi from "../services/api/ProductApi";
import { NotificationStore } from "./NotificationStore";

export type { ProductTypeFilter, StockFilter } from "utils/productFilters";

export type DialogMode =
	| { kind: "form"; product?: Product }
	| { kind: "archive"; product: Product }
	| { kind: "restore"; product: Product }
	| { kind: "delete"; product: Product }
	| { kind: "cannotDelete"; product: Product }
	| { kind: "none" };

export interface IProductStore {
	allProducts: Loadable<Product[]>;
	saleProducts: Loadable<Product[]>;
	supplyProducts: Loadable<Product[]>;
	filteredProducts: Loadable<Product[]>;
	archivedCount: number;

	searchTerm: string;
	categoryFilter: Category | null;
	typeFilter: ProductTypeFilter;
	stockFilter: StockFilter;
	showArchived: boolean;
	isSaving: boolean;
	dialogMode: DialogMode;

	getAll(): Promise<void>;
	/** Resolve with the created product, or null on failure. */
	create(
		request: CreateProductRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<Product | null>;
	/** Resolve with the fresh product on success, or null on failure. */
	update(
		request: UpdateProductRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<Product | null>;
	archive(product: Product): Promise<Product | null>;
	restore(product: Product): Promise<Product | null>;
	remove(product: Product): Promise<boolean>;

	setSearch(term: string): void;
	setCategoryFilter(category: Category | null): void;
	setTypeFilter(filter: ProductTypeFilter): void;
	setStockFilter(filter: StockFilter): void;
	setShowArchived(show: boolean): void;

	openCreate(): void;
	openEdit(product: Product): void;
	openArchive(product: Product): void;
	openRestore(product: Product): void;
	openDelete(product: Product): void;
	closeDialog(): void;
}

export class ProductStore implements IProductStore {
	private readonly notificationStore: NotificationStore;

	allProducts: Loadable<Product[]> = "loading";
	searchTerm = "";
	categoryFilter: Category | null = null;
	typeFilter: ProductTypeFilter = "all";
	stockFilter: StockFilter = "all";
	showArchived = false;
	isSaving = false;
	dialogMode: DialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Total archived products — drives the «Архив» toggle badge (unfiltered). */
	get archivedCount(): number {
		if (!isReady(this.allProducts)) {
			return 0;
		}
		return this.allProducts.filter((p) => p.isArchived).length;
	}

	get filteredProducts(): Loadable<Product[]> {
		if (!isReady(this.allProducts)) {
			return this.allProducts;
		}

		// «Активные | Архив» segmented view: each side shows only its set (the
		// «Архив» view swaps to archived-only — DSN-2 — not active + archived).
		let products = this.allProducts.filter((p) =>
			this.showArchived ? p.isArchived : !p.isArchived,
		);

		const categoryId = this.categoryFilter?.id;
		if (categoryId != null) {
			products = products.filter((p) => p.categoryId === categoryId);
		}

		if (this.typeFilter !== "all") {
			products = products.filter((p) => matchesType(p.type, this.typeFilter));
		}

		if (this.stockFilter !== "all") {
			products = products.filter((p) => matchesStockFilter(productStockLevel(p), this.stockFilter));
		}

		if (this.searchTerm.trim()) {
			products = products.filter((p) => matchesProductSearch(p, this.searchTerm));
		}

		return products;
	}

	/** Sellable products (active only) — for the sales line picker. */
	get saleProducts(): Loadable<Product[]> {
		if (!isReady(this.allProducts)) {
			return this.allProducts;
		}
		return this.allProducts.filter((p) => !p.isArchived && p.type !== "Supply");
	}

	/** Supplyable products (active only) — for the supply line picker. */
	get supplyProducts(): Loadable<Product[]> {
		if (!isReady(this.allProducts)) {
			return this.allProducts;
		}
		return this.allProducts.filter((p) => !p.isArchived && p.type !== "Sale");
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allProducts = "loading"));

		const result = await tryRun(() => ProductApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "product.error.getAll");
		}

		runInAction(() => (this.allProducts = toLoadable(result)));
	}

	async create(
		request: CreateProductRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<Product | null> {
		const result = await withSaving(this, () => ProductApi.create(request));

		if (result.status === "fail") {
			if (!applyServerErrors?.(result.cause)) {
				this.notificationStore.notifyApiError(result, "product.error.create");
			}
			return null;
		}

		runInAction(() => {
			if (isReady(this.allProducts)) {
				this.allProducts = [result.data, ...this.allProducts];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.create"));
		return result.data;
	}

	async update(
		request: UpdateProductRequest,
		applyServerErrors?: ServerErrorHandler,
	): Promise<Product | null> {
		const result = await withSaving(this, () => ProductApi.update(request));

		if (result.status === "fail") {
			if (!applyServerErrors?.(result.cause)) {
				this.notificationStore.notifyApiError(result, "product.error.update");
			}
			return null;
		}

		runInAction(() => {
			if (isReady(this.allProducts)) {
				this.allProducts = this.allProducts.map((p) => (p.id === result.data.id ? result.data : p));
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.update"));
		return result.data;
	}

	async archive(product: Product): Promise<Product | null> {
		const result = await withSaving(this, () => ProductApi.archive(product.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "product.error.archive");
			return null;
		}

		// Backend returns 204 — refetch the updated product to refresh the row.
		const updated = await this.refreshProduct(product.id);
		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.archive", { name: product.name }));
		return updated;
	}

	async restore(product: Product): Promise<Product | null> {
		const result = await withSaving(this, () => ProductApi.restore(product.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "product.error.restore");
			return null;
		}

		const updated = await this.refreshProduct(product.id);
		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.restore", { name: product.name }));
		return updated;
	}

	async remove(product: Product): Promise<boolean> {
		const result = await withSaving(this, () => ProductApi.delete(product.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "product.error.delete");
			return false;
		}

		runInAction(() => {
			if (isReady(this.allProducts)) {
				this.allProducts = this.allProducts.filter((p) => p.id !== product.id);
			}
		});
		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.delete", { name: product.name }));
		return true;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setCategoryFilter(category: Category | null): void {
		this.categoryFilter = category;
	}

	setTypeFilter(filter: ProductTypeFilter): void {
		this.typeFilter = filter;
	}

	setStockFilter(filter: StockFilter): void {
		this.stockFilter = filter;
	}

	setShowArchived(show: boolean): void {
		this.showArchived = show;
	}

	openCreate(): void {
		this.dialogMode = { kind: "form" };
	}

	openEdit(product: Product): void {
		this.dialogMode = { kind: "form", product };
	}

	openArchive(product: Product): void {
		this.dialogMode = { kind: "archive", product };
	}

	openRestore(product: Product): void {
		this.dialogMode = { kind: "restore", product };
	}

	/** Delete is reference-gated: a referenced product gets «cannot delete — archive instead». */
	openDelete(product: Product): void {
		this.dialogMode = product.isDeletable
			? { kind: "delete", product }
			: { kind: "cannotDelete", product };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	/** Refetch a single product (after a 204 mutation) and update the row in place. */
	private async refreshProduct(id: number): Promise<Product | null> {
		const result = await tryRun(() => ProductApi.getById(id));
		const updated = result.status === "success" ? result.data : null;
		if (updated) {
			this.replaceProduct(updated);
		}
		return updated;
	}

	private replaceProduct(updated: Product): void {
		runInAction(() => {
			if (isReady(this.allProducts)) {
				this.allProducts = this.allProducts.map((p) => (p.id === updated.id ? updated : p));
			}
		});
	}
}

export default ProductStore;
