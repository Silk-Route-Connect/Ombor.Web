import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

export interface ICategoryStore {
	categories: Loadable<Category[]>;
	filteredCategories: Loadable<Category[]>;
	selectedCategory: Loadable<Category | null>;
	searchQuery: string;
	isFormModalOpen: boolean;

	openFormModal(category?: Category): void;
	closeFormModal(): void;
	selectCategory(category: Category): void;
	clearSelection(): void;
	filterCategories(query: string): void;
	loadCategories(): Promise<void>;
	createCategory(category: CreateCategoryRequest): Promise<void>;
	updateCategory(category: UpdateCategoryRequest): Promise<void>;
	deleteCategory(id: number): Promise<void>;
}

export class CategoryStore implements ICategoryStore {
	categories: Loadable<Category[]> = [];
	selectedCategory: Loadable<Category | null> = null;
	searchQuery = "";
	isFormModalOpen = false;

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredCategories(): Loadable<Category[]> {
		if (this.categories === "loading") {
			return "loading";
		}

		if (!this.searchQuery) {
			return this.categories;
		}

		if (this.categories.length === 0) {
			return [];
		}

		const query = this.searchQuery.toLowerCase();
		return this.categories.filter(
			(category) =>
				category.name.toLowerCase().includes(query) ||
				category?.description?.toLowerCase().includes(query),
		);
	}

	openFormModal(category?: Category) {
		this.selectedCategory = category ?? null;
		this.isFormModalOpen = true;
	}

	closeFormModal() {
		this.selectedCategory = null;
		this.isFormModalOpen = false;
	}

	selectCategory(category: Category | null) {
		this.selectedCategory = category;
	}

	clearSelection() {
		this.selectedCategory = null;
	}

	filterCategories(query: string) {
		this.searchQuery = query;
	}

	async loadCategories() {
		this.categories = "loading";
		const result = await tryRun(() => CategoryApi.getAll({ searchTerm: this.searchQuery }));

		if (result.status === "fail") {
			this.categories = [];
			this.notificationStore.error(translate("loadCategoriesError") + `: ${result.error}`);
			return;
		}

		this.categories = result.data;
	}

	async createCategory(request: CreateCategoryRequest): Promise<void> {
		const result = await tryRun(() => CategoryApi.create(request));

		if (result.status === "fail") {
			// Handle error (e.g., show a notification)
			return;
		}

		runInAction(() => {
			if (this.categories === "loading") {
				return;
			}

			this.categories = [result.data, ...this.categories];
			this.selectedCategory = result.data;
			this.isFormModalOpen = false;
		});
	}

	async updateCategory(request: UpdateCategoryRequest): Promise<void> {
		const result = await tryRun(() => CategoryApi.update(request));

		if (result.status === "fail") {
			// Handle error (e.g., show a notification)
			return;
		}

		runInAction(() => {
			if (this.categories === "loading") {
				return;
			}

			this.categories = this.categories.map((category) =>
				category.id === result.data.id ? result.data : category,
			);
			this.selectedCategory = result.data;
			this.isFormModalOpen = false;
		});
	}

	async deleteCategory(id: number): Promise<void> {
		const result = await tryRun(() => CategoryApi.delete(id));

		if (result.status === "fail") {
			// Handle error (e.g., show a notification)
			return;
		}

		runInAction(() => {
			if (this.categories === "loading") {
				return;
			}

			this.categories = this.categories.filter((category) => category.id !== id);
			this.selectedCategory = null;
		});
	}
}

export default CategoryStore;
