import { SortOrder } from "components/shared/DataTable/DataTable";
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

export interface ICategoryStore {
	allCategories: Loadable<Category[]>;
	filteredCategories: Loadable<Category[]>;
	selectedCategory: Category | null;

	searchTerm: string;
	sortField: keyof Category | null;
	sortOrder: SortOrder;
	isSaving: boolean;

	// actions
	getAll(): Promise<void>;
	create(category: CreateCategoryRequest): Promise<void>;
	update(category: UpdateCategoryRequest): Promise<void>;
	delete(id: number): Promise<void>;

	// setters for filters & sorting
	setSearch(query: string): void;
	setSort(field: keyof Category, order: "asc" | "desc"): void;
}

export class CategoryStore implements ICategoryStore {
	private readonly notificationStore: NotificationStore;

	allCategories: Loadable<Category[]> = [];
	selectedCategory: Category | null = null;
	searchTerm = "";
	sortField: keyof Category | null = null;
	sortOrder: SortOrder = "asc";
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredCategories(): Loadable<Category[]> {
		const filtered = this.applySearch(this.allCategories);

		return this.applySort(filtered);
	}

	async getAll() {
		if (this.allCategories === "loading") {
			return;
		}

		runInAction(() => (this.allCategories = "loading"));

		const result = await tryRun(() => CategoryApi.getAll({ searchTerm: this.searchTerm }));

		if (result.status === "fail") {
			this.notificationStore.error(translate("category.error.load") + `: ${result.error}`);
		}

		const data = result.status === "success" ? result.data : [];
		runInAction(() => (this.allCategories = data));
	}

	async create(request: CreateCategoryRequest): Promise<void> {
		if (this.isSaving) {
			return;
		}

		runInAction(() => (this.isSaving = true));

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
			this.isSaving = false;
		});

		this.notificationStore.success(translate("category.success.create"));
	}

	async update(request: UpdateCategoryRequest): Promise<void> {
		if (this.isSaving) {
			return;
		}

		runInAction(() => (this.isSaving = true));

		const result = await tryRun(() => CategoryApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("category.error.update"));
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
			this.isSaving = false;
		});

		this.notificationStore.success(translate("category.success.update"));
	}

	async delete(id: number): Promise<void> {
		if (this.isSaving) {
			return;
		}

		runInAction(() => (this.isSaving = true));

		const result = await tryRun(() => CategoryApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("category.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = this.allCategories.filter((category) => category.id !== id);
			this.selectedCategory = null;
			this.isSaving = false;
		});

		this.notificationStore.success(translate("category.success.delete"));
	}

	setSearch(query: string) {
		runInAction(() => (this.searchTerm = query));
	}

	setSort(field: keyof Category, order: "asc" | "desc") {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}

	private applySearch(data: Loadable<Category[]>): Loadable<Category[]> {
		if (data === "loading" || !this.searchTerm) {
			return data;
		}

		const query = this.searchTerm.toLowerCase();

		return data.filter(
			(category) =>
				category.name.toLowerCase().includes(query) ||
				(category.description?.toLowerCase().includes(query) ?? false),
		);
	}

	private applySort(data: Loadable<Category[]>): Loadable<Category[]> {
		if (data === "loading" || !this.sortField) {
			return data;
		}

		const sortField = this.sortField;

		return [...data].sort((a, b) => {
			const aVal = a[sortField] ?? "";
			const bVal = b[sortField] ?? "";

			if (aVal < bVal) {
				return this.sortOrder === "asc" ? -1 : 1;
			}

			if (aVal > bVal) {
				return this.sortOrder === "asc" ? 1 : -1;
			}

			return 0;
		});
	}
}

export default CategoryStore;
