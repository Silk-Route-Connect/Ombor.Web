import { SortOrder } from "components/shared/DataTable/DataTable";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

type DialogMode =
	| { type: "form"; category?: Category }
	| { type: "delete"; category: Category }
	| { type: "none" };

export interface ICategoryStore {
	allCategories: Loadable<Category[]>;
	filteredCategories: Loadable<Category[]>;
	selectedCategory: Category | null;

	searchTerm: string;
	sortField: keyof Category | null;
	sortOrder: SortOrder;
	isSaving: boolean;
	dialogMode: DialogMode;

	// actions
	getAll(): Promise<void>;
	create(category: CreateCategoryRequest): Promise<void>;
	update(category: UpdateCategoryRequest): Promise<void>;
	delete(id: number): Promise<void>;

	// setters for filters & sorting
	setSearch(query: string): void;
	setSort(field: keyof Category, order: "asc" | "desc"): void;

	// UI dialog helper methods
	openCreate(): void;
	openEdit(category: Category): void;
	openDelete(category: Category): void;
	closeDialog(): void;
}

export class CategoryStore implements ICategoryStore {
	private readonly notificationStore: NotificationStore;

	allCategories: Loadable<Category[]> = [];
	selectedCategory: Category | null = null;
	searchTerm = "";
	sortField: keyof Category | null = null;
	sortOrder: SortOrder = "asc";
	isSaving: boolean = false;
	dialogMode: DialogMode = { type: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
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
		const result = await withSaving(this, () => CategoryApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("category.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = [result.data, ...this.allCategories];
		});

		this.closeDialog();
		this.notificationStore.success(translate("category.success.create"));
	}

	async update(request: UpdateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.update(request));

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
		});

		this.closeDialog();
		this.notificationStore.success(translate("category.success.update"));
	}

	async delete(id: number): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("category.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allCategories === "loading") {
				return;
			}

			this.allCategories = this.allCategories.filter((category) => category.id !== id);
		});

		this.closeDialog();
		this.notificationStore.success(translate("category.success.delete"));
	}

	setSearch(query: string) {
		this.searchTerm = query;
	}

	setSort(field: keyof Category, order: "asc" | "desc") {
		this.sortField = field;
		this.sortOrder = order;
	}

	openCreate() {
		this.selectedCategory = null;
		this.dialogMode = { type: "form" };
	}

	openEdit(category: Category) {
		this.selectedCategory = category;
		this.dialogMode = { type: "form", category };
	}

	openDelete(category: Category) {
		this.selectedCategory = category;
		this.dialogMode = { type: "delete", category };
	}

	closeDialog() {
		this.selectedCategory = null;
		this.dialogMode = { type: "none" };
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

export default CategoryStore;
