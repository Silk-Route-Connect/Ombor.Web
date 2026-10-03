import { isReady, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { describeApiError } from "utils/apiError";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../models/category";
import CategoryApi from "../services/api/CategoryApi";
import { NotificationStore } from "./NotificationStore";

type DialogMode =
	| { type: "form"; category?: Category }
	| { type: "delete"; category: Category }
	| { type: "deleteBlocked"; category: Category }
	| { type: "none" };

export interface ICategoryStore {
	allCategories: Loadable<Category[]>;
	filteredCategories: Loadable<Category[]>;
	selectedCategory: Category | null;

	searchTerm: string;
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
	isSaving = false;
	dialogMode: DialogMode = { type: "none" };
	deleteError: string | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredCategories(): Loadable<Category[]> {
		return this.applySearch(this.allCategories);
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allCategories = "loading"));

		const result = await tryRun(() => CategoryApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "category.error.load");
		}

		runInAction(() => (this.allCategories = toLoadable(result)));
	}

	async create(request: CreateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "category.error.create");
			return;
		}

		runInAction(() => {
			if (isReady(this.allCategories)) {
				this.allCategories = [result.data, ...this.allCategories];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("category.success.create"));
	}

	async update(request: UpdateCategoryRequest): Promise<void> {
		const result = await withSaving(this, () => CategoryApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "category.error.update");
			return;
		}

		runInAction(() => {
			if (isReady(this.allCategories)) {
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
				if (isReady(this.allCategories)) {
					this.allCategories = this.allCategories.filter((category) => category.id !== id);
				}
			});

			this.closeDialog();
			this.notificationStore.success(i18next.t("category.success.delete"));
		} catch (error) {
			// Reached only for categories the pre-check deemed deletable; if the API
			// still rejects (e.g. a 409 because counts changed), show the localized
			// reason inline rather than a generic toast.
			runInAction(() => (this.deleteError = describeApiError(error, "category.error.delete")));
		} finally {
			runInAction(() => (this.isSaving = false));
		}
	}

	setSearch(query: string): void {
		this.searchTerm = query;
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
		// Delete stays enabled everywhere (never silently disabled); pre-check picks
		// the inline blocked dialog for a referenced category — the case the backend
		// rejects with 409 (business-rules rule 32). The confirm path still surfaces
		// any backend error inline via apiError.
		this.dialogMode =
			category.productCount > 0
				? { type: "deleteBlocked", category }
				: { type: "delete", category };
	}

	closeDialog(): void {
		this.selectedCategory = null;
		this.deleteError = null;
		this.dialogMode = { type: "none" };
	}

	private applySearch(data: Loadable<Category[]>): Loadable<Category[]> {
		if (!isReady(data) || !this.searchTerm.trim()) {
			return data;
		}

		return data.filter(
			(category) =>
				matchesSearch(category.name, this.searchTerm) ||
				matchesSearch(category.description, this.searchTerm),
		);
	}
}

export default CategoryStore;
