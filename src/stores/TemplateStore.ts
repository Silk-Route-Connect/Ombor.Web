import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Partner } from "models/partner";
import {
	CreateTemplateRequest,
	GetTemplateByIdRequest,
	Template,
	TemplateType,
	UpdateTemplateRequest,
} from "models/template";
import TemplateApi from "services/api/TemplateApi";

import { NotificationStore } from "./NotificationStore";

/** The redesigned list uses one modal for create + edit (`form`) plus a delete confirm. */
export type DialogMode =
	| { kind: "form"; template?: Template }
	| { kind: "delete"; template: Template }
	| { kind: "none" };

/** Segmented type filter on the list toolbar. */
export type TemplateTypeFilter = "all" | TemplateType;

export interface ITemplateStore {
	// data
	allTemplates: Loadable<Template[]>;

	// redesigned list view
	listTemplates: Loadable<Template[]>;
	searchTerm: string;
	typeFilter: TemplateTypeFilter;

	// legacy New Sale/Supply autocomplete surface (kept until that flow is rebuilt)
	filteredTemplates: Loadable<Template[]>;
	supplyTemplates: Loadable<Template[]>;
	saleTemplates: Loadable<Template[]>;
	selectedPartner: Partner | null;

	// UI state
	selectedTemplate: Template | null;
	dialogMode: DialogMode;
	isSaving: boolean;

	// actions
	getAll(): Promise<void>;
	getById(templateId: number): Promise<void>;
	create(request: CreateTemplateRequest): Promise<void>;
	update(request: UpdateTemplateRequest): Promise<void>;
	delete(templateId: number): Promise<void>;

	// list filters
	setSearch(searchTerm: string): void;
	setTypeFilter(type: TemplateTypeFilter): void;
	resetFilters(): void;

	// legacy autocomplete filter
	setSelectedPartner(partner?: Partner | null): void;

	// dialogs
	openCreate(): void;
	openEdit(template: Template): void;
	openDelete(template: Template): void;
	closeDialog(): void;
}

export class TemplateStore implements ITemplateStore {
	private readonly notificationStore: NotificationStore;

	allTemplates: Loadable<Template[]> = [];

	searchTerm: string = "";
	typeFilter: TemplateTypeFilter = "all";
	selectedPartner: Partner | null = null;

	selectedTemplate: Template | null = null;
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** The redesigned list: search (name or partner) + the type segment. */
	get listTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		let templates = this.allTemplates;

		if (this.typeFilter !== "all") {
			templates = templates.filter((el) => el.type === this.typeFilter);
		}

		const term = this.searchTerm.trim().toLowerCase();
		if (term) {
			templates = templates.filter(
				(el) => el.name.toLowerCase().includes(term) || el.partnerName.toLowerCase().includes(term),
			);
		}

		return [...templates];
	}

	/**
	 * Legacy surface for the still-unbuilt New Sale/Supply template autocomplete —
	 * narrows by the picked partner only (the autocomplete does its own text
	 * search). Decoupled from the list's search/type so the two views never
	 * cross-contaminate.
	 */
	get filteredTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		const partnerId = this.selectedPartner?.id;
		if (!partnerId) {
			return [...this.allTemplates];
		}

		return this.allTemplates.filter((el) => el.partnerId === partnerId);
	}

	get supplyTemplates(): Loadable<Template[]> {
		if (this.filteredTemplates === "loading") {
			return "loading";
		}

		return this.filteredTemplates.filter((el) => el.type === "Supply");
	}

	get saleTemplates(): Loadable<Template[]> {
		if (this.filteredTemplates === "loading") {
			return "loading";
		}

		return this.filteredTemplates.filter((el) => el.type === "Sale");
	}

	async getAll() {
		if (this.allTemplates === "loading") {
			return;
		}

		runInAction(() => (this.allTemplates = "loading"));

		const result = await tryRun(() => TemplateApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("template.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allTemplates = data));
	}

	async getById(templateId: number): Promise<void> {
		const request: GetTemplateByIdRequest = { id: templateId };
		const result = await tryRun(() => TemplateApi.getById(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("template.error.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.selectedTemplate = data));
	}

	async create(request: CreateTemplateRequest): Promise<void> {
		const result = await withSaving(this, () => TemplateApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("template.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = [result.data, ...this.allTemplates];
			}
		});

		this.closeDialog();
		this.notificationStore.success(
			i18next.t("template.success.create", { name: result.data.name }),
		);
	}

	async update(request: UpdateTemplateRequest): Promise<void> {
		const result = await withSaving(this, () => TemplateApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("template.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.map((el) =>
					el.id === result.data.id ? result.data : el,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(
			i18next.t("template.success.update", { name: result.data.name }),
		);
	}

	async delete(templateId: number): Promise<void> {
		const name = this.selectedTemplate?.name ?? "";
		const result = await withSaving(this, () => TemplateApi.delete(templateId));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("template.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.filter((el) => el.id !== templateId);
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("template.success.delete", { name }));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setTypeFilter(type: TemplateTypeFilter): void {
		this.typeFilter = type;
	}

	resetFilters(): void {
		this.searchTerm = "";
		this.typeFilter = "all";
	}

	setSelectedPartner(partner?: Partner | null): void {
		this.selectedPartner = partner ?? null;
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(template: Template): void {
		this.setDialog({ kind: "form", template });
	}

	openDelete(template: Template): void {
		this.setDialog({ kind: "delete", template });
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		const template = "template" in mode ? (mode.template ?? null) : null;

		this.dialogMode = mode;
		this.selectedTemplate = template;
	}
}

export default TemplateStore;
