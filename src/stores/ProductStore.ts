// src/stores/ProductStore.ts
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { CreateProductRequest, Product, UpdateProductRequest } from "../models/product";
import ProductApi from "../services/api/ProductApi";
import { NotificationStore } from "./NotificationStore";

export interface IProductStore {
	allProducts: Loadable<Product[]>;
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

	private notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this);
	}

	get filteredProducts(): Loadable<Product[]> {
		if (this.allProducts === "loading") {
			return "loading";
		}

		let products = this.allProducts as Product[];

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

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setCategory(categoryId: number | null): void {
		this.categoryFilter = categoryId;
	}

	async loadProducts(): Promise<void> {
		this.allProducts = "loading";
		const params = {
			searchTerm: this.searchTerm,
			categoryId: this.categoryFilter ?? undefined,
		};
		const result = await tryRun(() => ProductApi.getAll(params));

		if (result.status === "fail") {
			runInAction(() => {
				this.allProducts = [];
			});
			this.notificationStore.error(translate("loadProductsError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			this.allProducts = result.data;
		});
	}

	async createProduct(request: CreateProductRequest): Promise<void> {
		const result = await tryRun(() => ProductApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("createProductError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allProducts !== "loading") {
				this.allProducts = [result.data, ...(this.allProducts as Product[])];
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
				this.allProducts = (this.allProducts as Product[]).map((p) => {
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
				this.allProducts = (this.allProducts as Product[]).filter((p) => {
					return p.id !== id;
				});
			}
		});
		this.notificationStore.success(translate("deleteProductSuccess"));
	}
}

export default ProductStore;
