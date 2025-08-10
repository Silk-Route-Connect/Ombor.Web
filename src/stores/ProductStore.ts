import { SortOrder } from "components/shared/DataTable/DataTable";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { Category } from "models/category";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { CreateProductRequest, Product, UpdateProductRequest } from "../models/product";
import ProductApi from "../services/api/ProductApi";
import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; product?: Product }
	| { kind: "delete"; product: Product }
	| { kind: "details"; product: Product }
	| { kind: "none" };

export interface IProductStore {
	// computed properties
	allProducts: Loadable<Product[]>;
	saleProducts: Loadable<Product[]>;
	supplyProducts: Loadable<Product[]>;
	filteredProducts: Loadable<Product[]>;

	// UI state
	selectedProduct: Product | null;
	searchTerm: string;
	categoryFilter: Category | null;
	sortField: keyof Product | null;
	sortOrder: SortOrder;
	isSaving: boolean;
	dialogMode: DialogMode;

	// actions
	getAll(): Promise<void>;
	create(request: CreateProductRequest): Promise<void>;
	update(request: UpdateProductRequest): Promise<void>;
	delete(productId: number): Promise<void>;

	// setters for filters & sorting
	setSearch(term: string): void;
	setCategoryFilter(category: Category | null): void;
	setSort(field: keyof Product, order: SortOrder): void;

	// UI dialog helper methods
	openCreate(): void;
	openEdit(product: Product): void;
	openDelete(product: Product): void;
	openDetails(product: Product): void;
	closeDialog(): void;
}

export class ProductStore implements IProductStore {
	private readonly notificationStore: NotificationStore;

	allProducts: Loadable<Product[]> = [];
	searchTerm = "";
	categoryFilter: Category | null = null;
	selectedProduct: Product | null = null;
	isSaving: boolean = false;
	dialogMode: DialogMode = { kind: "none" };
	sortField: keyof Product | null = null;
	sortOrder: SortOrder = "asc";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredProducts(): Loadable<Product[]> {
		if (this.allProducts === "loading") {
			return "loading";
		}

		let products = this.allProducts;

		if (this.searchTerm) {
			const q = this.searchTerm.toLowerCase();
			products = products.filter((p) => {
				return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
			});
		}

		const categoryId = this.categoryFilter?.id;
		if (categoryId) {
			products = products.filter((p) => p.categoryId === categoryId);
		}

		return products;
	}

	get saleProducts(): Loadable<Product[]> {
		if (this.filteredProducts === "loading") {
			return "loading";
		}

		return this.filteredProducts.filter((el) => el.type !== "Supply");
	}

	get supplyProducts(): Loadable<Product[]> {
		if (this.filteredProducts === "loading") {
			return "loading";
		}

		return this.filteredProducts.filter((el) => el.type !== "Sale");
	}

	async getAll(): Promise<void> {
		if (this.allProducts === "loading") {
			return;
		}

		runInAction(() => (this.allProducts = "loading"));

		const result = await tryRun(() => ProductApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("product.error.getAll"));
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allProducts = data));
	}

	async create(request: CreateProductRequest): Promise<void> {
		const result = await withSaving(this, () => ProductApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("product.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = [result.data, ...this.allProducts];
			}
		});

		this.notificationStore.success(translate("product.success.create"));
	}

	async update(request: UpdateProductRequest): Promise<void> {
		const result = await withSaving(this, () => ProductApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("product.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.map((p) => (p.id === result.data.id ? result.data : p));
			}
		});

		this.notificationStore.success(translate("product.success.update"));
	}

	async delete(id: number): Promise<void> {
		const result = await withSaving(this, () => ProductApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("product.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.filter((p) => p.id !== id);
			}
		});

		this.notificationStore.success(translate("product.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setCategoryFilter(category: Category | null): void {
		this.categoryFilter = category;
	}

	setSort(field: keyof Product, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(product: Product): void {
		this.setDialog({ kind: "form", product: product });
	}

	openDelete(product: Product): void {
		this.setDialog({ kind: "delete", product: product });
	}

	openDetails(product: Product): void {
		this.setDialog({ kind: "details", product: product });
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	private setDialog(mode: DialogMode) {
		const product = "product" in mode ? (mode.product ?? null) : null;

		this.dialogMode = mode;
		this.selectedProduct = product;
	}
}

export default ProductStore;
