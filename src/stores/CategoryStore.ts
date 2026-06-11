import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
// Pickers (autocompletes) need every category, not a single page.
const PICKER_PAGE_SIZE = 1000;

type DialogMode =
	| { type: "form"; category?: Category }
	| { type: "delete"; category: Category }
	| { type: "deleteBlocked"; category: Category }
	| { type: "none" };

export interface ICategoryStore {
	categories: Loadable<Category[]>;
	allCategories: Loadable<Category[]>;
	total: number;
	page: number;
	pageSize: number;
	searchTerm: string;
	isSaving: boolean;
	dialogMode: DialogMode;
	selectedCategory: Category | null;

	// data
	getAll(): Promise<void>;
	loadAllCategories(): Promise<void>;
	create(category: CreateCategoryRequest): Promise<void>;
	update(category: UpdateCategoryRequest): Promise<void>;
	delete(id: number): Promise<void>;

	// list controls
	setSearch(query: string): void;
	setPage(page: number): void;
	setPageSize(pageSize: number): void;

	// dialogs
	openCreate(): void;
	openEdit(category: Category): void;
	openDelete(category: Category): void;
	closeDialog(): void;
}

// Debounce handle for search-driven reloads; kept off the observable instance.
let searchTimer: ReturnType<typeof setTimeout> | undefined;

export class CategoryStore implements ICategoryStore {
	private readonly notificationStore: NotificationStore;

	categories: Loadable<Category[]> = "loading";
	allCategories: Loadable<Category[]> = "loading";
	total = 0;
	page = 0;
	pageSize = DEFAULT_PAGE_SIZE;
	searchTerm = "";
	isSaving = false;
	dialogMode: DialogMode = { type: "none" };
	selectedCategory: Category | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.categories = "loading"));

		const result = await tryRun(() =>
			CategoryApi.getAll({
				page: this.page + 1, // API is 1-based
				pageSize: this.pageSize,
				search: this.searchTerm || undefined,
			}),
		);

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.load") + `: ${result.error}`);
			runInAction(() => {
				this.categories = [];
				this.total = 0;
			});
			return;
		}

		runInAction(() => {
			this.categories = result.data.items;
			this.total = result.data.total;
		});
	}

	/** Full, unpaged list for pickers/autocompletes (CategoryAutocomplete). */
	async loadAllCategories(): Promise<void> {
		runInAction(() => (this.allCategories = "loading"));

		const result = await tryRun(() => CategoryApi.getAll({ page: 1, pageSize: PICKER_PAGE_SIZE }));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.load") + `: ${result.error}`);
			runInAction(() => (this.allCategories = []));
			return;
		}

		runInAction(() => (this.allCategories = result.data.items));
	}

	async create(request: CreateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.create"));
			return;
		}

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.create"));
		await this.getAll();
	}

	async update(request: UpdateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.update"));
			return;
		}

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.update"));
		await this.getAll();
	}

	async delete(id: number): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.delete"));
			return;
		}

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.delete"));
		// Stepping back a page when the last row on the final page is removed.
		if (this.categories !== "loading" && this.categories.length === 1 && this.page > 0) {
			runInAction(() => (this.page -= 1));
		}
		await this.getAll();
	}

	setSearch(query: string): void {
		this.searchTerm = query;
		this.page = 0;

		if (searchTimer) {
			clearTimeout(searchTimer);
		}
		searchTimer = setTimeout(() => this.getAll(), SEARCH_DEBOUNCE_MS);
	}

	setPage(page: number): void {
		this.page = page;
		this.getAll();
	}

	setPageSize(pageSize: number): void {
		this.pageSize = pageSize;
		this.page = 0;
		this.getAll();
	}

	openCreate(): void {
		this.selectedCategory = null;
		this.dialogMode = { type: "form" };
	}

	openEdit(category: Category): void {
		this.selectedCategory = category;
		this.dialogMode = { type: "form", category };
	}

	openDelete(category: Category): void {
		this.selectedCategory = category;
		// Delete stays enabled everywhere (never silently disabled); the dialog
		// explains inline when the category cannot be removed: the Default
		// Category is system-created, and a referenced category would orphan
		// products (business-rules rule 32).
		const blocked = category.isDefault || category.productCount > 0;
		this.dialogMode = blocked ? { type: "deleteBlocked", category } : { type: "delete", category };
	}

	closeDialog(): void {
		this.selectedCategory = null;
		this.dialogMode = { type: "none" };
	}
}

export default CategoryStore;
