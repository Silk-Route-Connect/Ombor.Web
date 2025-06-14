import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { CreateProductRequest, Product, UpdateProductRequest } from "../models/product";
import ProductApi from "../services/api/ProductApi";
import { NotificationStore } from "./NotificationStore";

export interface IProductStore {
	allProducts: Loadable<Product[]>;
	saleProducts: Loadable<Product[]>;
	supplyProducts: Loadable<Product[]>;
	searchTerm: string;
	categoryFilter: number | null;
	filteredProducts: Loadable<Product[]>;

	setSearch(term: string): void;
	setCategory(categoryId: number | null): void;
	loadProducts(): Promise<void>;
	createProduct(request: CreateProductRequest): Promise<void>;
	updateProduct(request: UpdateProductRequest): Promise<void>;
	deleteProduct(id: number): Promise<void>;
}

export class ProductStore implements IProductStore {
	allProducts: Loadable<Product[]> = [];
	searchTerm = "";
	categoryFilter: number | null = null;

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this);
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

		if (this.categoryFilter !== null) {
			products = products.filter((p) => {
				return p.categoryId === this.categoryFilter;
			});
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

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setCategory(categoryId: number | null): void {
		this.categoryFilter = categoryId;
	}

	async loadProducts(): Promise<void> {
		if (this.allProducts === "loading") {
			return;
		}

		runInAction(() => (this.allProducts = "loading"));

		const result = await tryRun(() => ProductApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("loadProductsError") + `: ${result.error}`);
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allProducts = data));
	}

	async createProduct(request: CreateProductRequest): Promise<void> {
		const result = await tryRun(() => ProductApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("createProductError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = [result.data, ...this.allProducts];
			}
		});
		this.notificationStore.success(translate("createProductSuccess"));
	}

	async updateProduct(request: UpdateProductRequest): Promise<void> {
		const result = await tryRun(() => ProductApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("updateProductError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.map((p) => {
					if (p.id === result.data.id) {
						return result.data;
					}
					return p;
				});
			}
		});
		this.notificationStore.success(translate("updateProductSuccess"));
	}

	async deleteProduct(id: number): Promise<void> {
		const result = await tryRun(() => ProductApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("deleteProductError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = this.allProducts.filter((p) => {
					return p.id !== id;
				});
			}
		});
		this.notificationStore.success(translate("deleteProductSuccess"));
	}
}

export default ProductStore;
