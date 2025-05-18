import { makeAutoObservable, runInAction } from "mobx";

import { CreateProductRequest, ProductDto, UpdateProductRequest } from "../models/product";
import { ProductApi } from "../services/api/ProductApi";
import { ICategoryStore } from "./CategoryStore";

export class ProductStore {
	products: ProductDto[] = [];
	selectedProduct: ProductDto | null = null;
	isLoading = false;
	searchQuery = "";
	page = 1;
	pageSize = 10;
	isFormModalOpen = false;
	isSidePaneOpen = false; // renamed
	private categoryStore: ICategoryStore;

	private productApi = new ProductApi();

	constructor(categoryStore: ICategoryStore) {
		this.categoryStore = categoryStore;

		makeAutoObservable(this);
	}

	openFormModal(product: ProductDto | null): void {
		this.selectedProduct = product;
		this.isFormModalOpen = true;
	}

	closeFormModal(): void {
		this.selectedProduct = null;
		this.isFormModalOpen = false;
	}

	/** renamed from openDrawer */
	openSidePane(product: ProductDto): void {
		this.selectedProduct = product;
		this.isSidePaneOpen = true;
	}

	/** renamed from closeDrawer */
	closeSidePane(): void {
		this.selectedProduct = null;
		this.isSidePaneOpen = false;
	}

	async loadProducts(): Promise<void> {
		this.isLoading = true;
		try {
			const response = await this.productApi.getAll();
			runInAction(() => {
				this.products = response;
			});
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async createProduct(data: CreateProductRequest): Promise<void> {
		const createdProduct = await this.productApi.create(data);

		runInAction(() => {
			this.products.unshift(createdProduct);
		});
	}

	async updateProduct(updated: UpdateProductRequest): Promise<void> {
		const updatedProduct = await this.productApi.update(updated);

		runInAction(() => {
			const index = this.products.findIndex((p) => p.id === updated.id);
			if (index !== -1) {
				this.products[index] = updatedProduct;
			}
		});
	}

	async deleteProduct(id: number): Promise<void> {
		await this.productApi.delete(id);

		runInAction(() => {
			this.products = this.products.filter((p) => p.id !== id);
		});
	}

	setSearchQuery(query: string): void {
		this.searchQuery = query;
		this.page = 1;
	}

	setPage(page: number): void {
		this.page = page;
	}

	get filteredProducts(): ProductDto[] {
		const q = this.searchQuery.toLowerCase();
		return this.products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode?.includes(q));
	}

	get paginatedProducts(): ProductDto[] {
		const start = (this.page - 1) * this.pageSize;
		return this.filteredProducts.slice(start, start + this.pageSize);
	}

	get totalPages(): number {
		return Math.ceil(this.filteredProducts.length / this.pageSize);
	}

	formatUZS(value: number): string {
		return value.toLocaleString("ru-RU", {
			style: "currency",
			currency: "UZS",
			maximumFractionDigits: 0,
		});
	}

	getCategoryName(categoryId: number): string {
		return "";
	}
}

export default ProductStore;
