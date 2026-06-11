import { SortOrder } from "components/shared/Table/DataTable/DataTable";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { getApiErrorMessage } from "utils/apiError";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
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
	deleteError: string | null;

	// data
	getAll(): Promise<void>;
	create(category: CreateCategoryRequest): Promise<void>;
	update(category: UpdateCategoryRequest): Promise<void>;
	delete(id: number): Promise<void>;

	// list controls (client-side)
	setSearch(query: string): void;
	setSort(field: keyof Category, order: SortOrder): void;

	// dialogs
	openCreate(): void;
	openEdit(category: Category): void;
	openDelete(category: Category): void;
	closeDialog(): void;
}

export class CategoryStore implements ICategoryStore {
	private readonly notificationStore: NotificationStore;

	allCategories: Loadable<Category[]> = "loading";
	selectedCategory: Category | null = null;
	searchTerm = "";
	sortField: keyof Category | null = null;
	sortOrder: SortOrder = "asc";
	isSaving = false;
	dialogMode: DialogMode = { type: "none" };
	deleteError: string | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredCategories(): Loadable<Category[]> {
		return this.applySort(this.applySearch(this.allCategories));
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allCategories = "loading"));

		const result = await tryRun(() => CategoryApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.load") + `: ${result.error}`);
		}

		runInAction(() => (this.allCategories = result.status === "success" ? result.data : []));
	}

	async create(request: CreateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allCategories !== "loading") {
				this.allCategories = [result.data, ...this.allCategories];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.create"));
	}

	async update(request: UpdateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("category.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allCategories !== "loading") {
				this.allCategories = this.allCategories.map((category) =>
					category.id === result.data.id ? result.data : category,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.update"));
	}

	async delete(id: number): Promise<void> {
		if (this.isSaving) {
			return;
		}

		runInAction(() => {
			this.isSaving = true;
			this.deleteError = null;
		});

		try {
			await CategoryApi.delete(id);

			runInAction(() => {
				if (this.allCategories !== "loading") {
					this.allCategories = this.allCategories.filter((category) => category.id !== id);
				}
			});

			this.closeDialog();
			this.notificationStore.success(i18next.t("category.success.delete"));
		} catch (error) {
			// The backend has no Default-category or reference-check concept yet, so
			// the only honest signal is its own error response — surfaced inline.
			runInAction(
				() => (this.deleteError = getApiErrorMessage(error) ?? i18next.t("category.error.delete")),
			);
		} finally {
			runInAction(() => (this.isSaving = false));
		}
	}

	setSearch(query: string): void {
		this.searchTerm = query;
	}

	setSort(field: keyof Category, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
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
		this.deleteError = null;
		this.dialogMode = { type: "delete", category };
	}

	closeDialog(): void {
		this.selectedCategory = null;
		this.deleteError = null;
		this.dialogMode = { type: "none" };
	}

	private applySearch(data: Loadable<Category[]>): Loadable<Category[]> {
		if (data === "loading" || !this.searchTerm.trim()) {
			return data;
		}

		return data.filter(
			(category) =>
				matchesSearch(category.name, this.searchTerm) ||
				matchesSearch(category.description, this.searchTerm),
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

			return asc * String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
		});
	}
}

export default CategoryStore;
