import { SortOrder } from "components/shared/Table/DataTable/DataTable";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { Category } from "models/category";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { CreateProductRequest, Product, UpdateProductRequest } from "../models/product";
import ProductApi from "../services/api/ProductApi";
import { NotificationStore } from "./NotificationStore";

/** Type filter tabs (prototype: Все / Продажа / Закупка / Оба). "both" matches
 * only products that are both sellable and supplyable (type "All"); "sale" and
 * "supply" inclusively match "All" too. */
export type ProductTypeFilter = "all" | "sale" | "supply" | "both";

export type DialogMode =
	| { kind: "form"; product?: Product }
	| { kind: "archive"; product: Product }
	| { kind: "restore"; product: Product }
	| { kind: "none" };

export interface IProductStore {
	allProducts: Loadable<Product[]>;
	saleProducts: Loadable<Product[]>;
	supplyProducts: Loadable<Product[]>;
	filteredProducts: Loadable<Product[]>;
	archivedCount: number;

	selectedProduct: Product | null;
	searchTerm: string;
	categoryFilter: Category | null;
	typeFilter: ProductTypeFilter;
	showArchived: boolean;
	sortField: keyof Product | null;
	sortOrder: SortOrder;
	isSaving: boolean;
	dialogMode: DialogMode;

	getAll(): Promise<void>;
	create(request: CreateProductRequest): Promise<void>;
	update(request: UpdateProductRequest): Promise<void>;
	archive(product: Product): Promise<void>;
	restore(product: Product): Promise<void>;

	setSearch(term: string): void;
	setCategoryFilter(category: Category | null): void;
	setTypeFilter(filter: ProductTypeFilter): void;
	setShowArchived(show: boolean): void;
	setSort(field: keyof Product, order: SortOrder): void;

	openCreate(): void;
	openEdit(product: Product): void;
	openArchive(product: Product): void;
	openRestore(product: Product): void;
	closeDialog(): void;
}

function matchesType(type: Product["type"], filter: ProductTypeFilter): boolean {
	switch (filter) {
		case "sale":
			return type === "Sale" || type === "All";
		case "supply":
			return type === "Supply" || type === "All";
		case "both":
			return type === "All";
		default:
			return true;
	}
}

export class ProductStore implements IProductStore {
	private readonly notificationStore: NotificationStore;

	allProducts: Loadable<Product[]> = "loading";
	// Kept for interface compatibility / the detail flow (session b); intentionally
	// not set by the list flow so the legacy SelectedProductStore reaction does not
	// fire against the (unmocked) transactions endpoint.
	selectedProduct: Product | null = null;
	searchTerm = "";
	categoryFilter: Category | null = null;
	typeFilter: ProductTypeFilter = "all";
	showArchived = false;
	isSaving = false;
	dialogMode: DialogMode = { kind: "none" };
	sortField: keyof Product | null = null;
	sortOrder: SortOrder = "asc";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Total archived products — drives the «Архив» toggle badge (unfiltered). */
	get archivedCount(): number {
		if (this.allProducts === "loading") {
			return 0;
		}
		return this.allProducts.filter((p) => p.isArchived).length;
	}

	get filteredProducts(): Loadable<Product[]> {
		if (this.allProducts === "loading") {
			return "loading";
		}

		let products = this.allProducts;

		if (!this.showArchived) {
			products = products.filter((p) => !p.isArchived);
		}

		const categoryId = this.categoryFilter?.id;
		if (categoryId != null) {
			products = products.filter((p) => p.categoryId === categoryId);
		}

		if (this.typeFilter !== "all") {
			products = products.filter((p) => matchesType(p.type, this.typeFilter));
		}

		if (this.searchTerm.trim()) {
			products = products.filter(
				(p) => matchesSearch(p.name, this.searchTerm) || matchesSearch(p.sku, this.searchTerm),
			);
		}

		return this.applySort(products);
	}

	/** Sellable products (active only) — for the sales line picker. */
	get saleProducts(): Loadable<Product[]> {
		if (this.allProducts === "loading") {
			return "loading";
		}
		return this.allProducts.filter((p) => !p.isArchived && p.type !== "Supply");
	}

	/** Supplyable products (active only) — for the supply line picker. */
	get supplyProducts(): Loadable<Product[]> {
		if (this.allProducts === "loading") {
			return "loading";
		}
		return this.allProducts.filter((p) => !p.isArchived && p.type !== "Sale");
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allProducts = "loading"));

		const result = await tryRun(() => ProductApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.getAll"));
		}

		runInAction(() => (this.allProducts = result.status === "success" ? result.data : []));
	}

	async create(request: CreateProductRequest): Promise<void> {
		const result = await withSaving(this, () => ProductApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = [result.data, ...this.allProducts];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.create"));
	}

	async update(request: UpdateProductRequest): Promise<void> {
		const result = await withSaving(this, () => ProductApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.map((p) => (p.id === result.data.id ? result.data : p));
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.update"));
	}

	async archive(product: Product): Promise<void> {
		const result = await withSaving(this, () => ProductApi.archive(product.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.archive"));
			return;
		}

		this.replaceProduct(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.archive", { name: product.name }));
	}

	async restore(product: Product): Promise<void> {
		const result = await withSaving(this, () => ProductApi.restore(product.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("product.error.restore"));
			return;
		}

		this.replaceProduct(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("product.success.restore", { name: product.name }));
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

	setShowArchived(show: boolean): void {
		this.showArchived = show;
	}

	setSort(field: keyof Product, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
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

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	private replaceProduct(updated: Product): void {
		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.map((p) => (p.id === updated.id ? updated : p));
			}
		});
	}

	private applySort(data: Product[]): Product[] {
		if (!this.sortField) {
			return data;
		}

		const field = this.sortField;
		const asc = this.sortOrder === "asc" ? 1 : -1;

		return [...data].sort((a, b) => {
			const aValue = a[field] ?? "";
			const bValue = b[field] ?? "";

			if (typeof aValue === "number" && typeof bValue === "number") {
				return asc * (aValue - bValue);
			}

			return asc * String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
		});
	}
}

export default ProductStore;
