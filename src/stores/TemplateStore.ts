import { SortOrder } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import { Partner } from "models/partner";
import {
	CreateTemplateRequest,
	GetTemplateByIdRequest,
	Template,
	UpdateTemplateRequest,
} from "models/template";
import TemplateApi from "services/api/TemplateApi";

import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; template?: Template }
	| { kind: "delete"; template: Template }
	| { kind: "details"; template: Template }
	| { kind: "none" };

export interface ITemplateStore {
	// computed properties
	allTemplates: Loadable<Template[]>;
	filteredTemplates: Loadable<Template[]>;
	supplyTemplates: Loadable<Template[]>;
	saleTemplates: Loadable<Template[]>;

	// UI state
	selectedPartner: Partner | null;
	selectedTemplate: Loadable<Template> | null;
	dialogMode: DialogMode;
	isSaving: boolean;

	// actions
	getAll(): Promise<void>;
	getById(templateId: number): Promise<void>;
	create(request: CreateTemplateRequest): Promise<void>;
	update(request: UpdateTemplateRequest): Promise<void>;
	delete(templateId: number): Promise<void>;

	// setters for filters & sorting
	setSearch(searchTerm: string): void;
	setSort(field: keyof Template, order: SortOrder): void;
	setSelectedPartner(partnerId?: Partner | null): void;
	setSelectedTemplate(template: Template | null): void;

	// UI dialog helper methods
	openCreate(): void;
	openEdit(template: Template): void;
	openDelete(template: Template): void;
	openDetails(template: Template): void;
	closeDialog(): void;
}

export class TemplateStore implements ITemplateStore {
	private readonly notificationStore: NotificationStore;

	allTemplates: Loadable<Template[]> = [];

	searchTerm: string = "";
	sortField: keyof Template | null = null;
	sortOrder: SortOrder = "asc";
	selectedPartner: Partner | null = null;
	selectedTemplate: Template | null = null;
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		let templates = this.allTemplates;

		if (this.searchTerm?.trim()) {
			templates = templates.filter((el) => el.name.includes(this.searchTerm));
		}

		const partnerId = this.selectedPartner?.id;
		if (partnerId) {
			templates = templates.filter((el) => el.partnerId === partnerId);
		}

		return [...templates];
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
			this.notificationStore.error(translate("templates.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allTemplates = data));
	}

	async getById(templateId: number): Promise<void> {
		const request: GetTemplateByIdRequest = { id: templateId };
		const result = await tryRun(() => TemplateApi.getById(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.selectedTemplate = data));
	}

	async create(request: CreateTemplateRequest): Promise<void> {
		const result = await withSaving(this, () => TemplateApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.create"));
			return;
		}

		if (this.allTemplates !== "loading") {
			this.allTemplates = [result.data, ...this.allTemplates];
		}

		this.closeDialog();
		this.notificationStore.success("templates.success.create");
	}

	async update(request: UpdateTemplateRequest): Promise<void> {
		const result = await withSaving(this, () => TemplateApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.update"));
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
		this.notificationStore.success(translate("templates.success.update"));
	}

	async delete(templateId: number): Promise<void> {
		const result = await withSaving(this, () => TemplateApi.delete(templateId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.filter((el) => el.id !== templateId);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("templates.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setSelectedPartner(partner?: Partner | null): void {
		if (!partner) {
			this.selectedPartner = null;
			return;
		}

		this.selectedPartner = partner;
	}

	setSelectedTemplate(template: Template | null): void {
		this.selectedTemplate = template;
	}

	setSort(field: keyof Template, order: SortOrder): void {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(template: Template): void {
		this.setDialog({ kind: "form", template: template });
	}

	openDelete(template: Template): void {
		this.setDialog({ kind: "delete", template: template });
	}

	openDetails(template: Template): void {
		this.setDialog({ kind: "details", template: template });
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
