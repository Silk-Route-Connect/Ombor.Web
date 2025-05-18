import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

export interface ICategoryStore {
	filteredCategories: Loadable<Category[]>;
	selectedCategory: Category | null;
	searchQuery: string;
	isFormModalOpen: boolean;

	search(query: string): void;
	sort(field: keyof Category, order: "asc" | "desc"): void;
	loadCategories(): Promise<void>;
	createCategory(category: CreateCategoryRequest): Promise<void>;
	updateCategory(category: UpdateCategoryRequest): Promise<void>;
	deleteCategory(id: number): Promise<void>;
}

export class CategoryStore implements ICategoryStore {
	allCategories: Loadable<Category[]> = [];
	selectedCategory: Category | null = null;
	searchQuery = "";
	isFormModalOpen = false;

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredCategories(): Loadable<Category[]> {
		if (this.allCategories === "loading") {
			return "loading";
		}

		if (!this.searchQuery) {
			return this.allCategories;
		}

		if (this.allCategories.length === 0) {
			return [];
		}

		const query = this.searchQuery.toLowerCase();

		return this.allCategories.filter(
			(category) =>
				category.name.toLowerCase().includes(query) ||
				category.description?.toLowerCase().includes(query),
		);
	}

	search(query: string) {
		this.searchQuery = query;
	}

	sort(field: keyof Category, order: "asc" | "desc") {
		if (this.allCategories === "loading") {
			return;
		}

		const sorted = [...this.allCategories].sort((a, b) => {
			const aVal = a[field] ?? "";
			const bVal = b[field] ?? "";

			if (aVal < bVal) {
				return order === "asc" ? -1 : 1;
			}

			if (aVal > bVal) {
				return order === "asc" ? 1 : -1;
			}

			return 0;
		});

		runInAction(() => (this.allCategories = sorted));
	}

	async loadCategories() {
		this.allCategories = "loading";
		const result = await tryRun(() => CategoryApi.getAll({ searchTerm: this.searchQuery }));

		if (result.status === "fail") {
			this.allCategories = [];
			this.notificationStore.error(translate("loadCategoriesError") + `: ${result.error}`);
			return;
		}

		this.allCategories = result.data;
	}

	async createCategory(request: CreateCategoryRequest): Promise<void> {
		const result = await tryRun(() => CategoryApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("createCategoryError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = [result.data, ...this.allCategories];
			this.selectedCategory = result.data;
			this.isFormModalOpen = false;
		});

		this.notificationStore.success(translate("createCategorySuccess"));
	}

	async updateCategory(request: UpdateCategoryRequest): Promise<void> {
		const result = await tryRun(() => CategoryApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("updateCategoryError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = this.allCategories.map((category) =>
				category.id === result.data.id ? result.data : category,
			);
			this.selectedCategory = result.data;
			this.isFormModalOpen = false;
		});

		this.notificationStore.success(translate("updateCategorySuccess"));
	}

	async deleteCategory(id: number): Promise<void> {
		const result = await tryRun(() => CategoryApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("deleteCategoryError") + `: ${result.error}`);
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = this.allCategories.filter((category) => category.id !== id);
			this.selectedCategory = null;
		});

		this.notificationStore.success(translate("deleteCategorySuccess"));
	}
}

export default CategoryStore;
