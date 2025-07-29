import { SortOrder } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
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

export interface ITemplateStore {
	allTemplates: Loadable<Template[]>;
	filteredTemplates: Loadable<Template[]>;
	supplyTemplates: Loadable<Template[]>;
	saleTemplates: Loadable<Template[]>;
	selectedPartner: Partner | null;
	selectedTemplate: Loadable<Template> | null;

	getAll(): Promise<void>;
	getById(templateId: number): Promise<void>;
	create(request: CreateTemplateRequest): Promise<void>;
	update(request: UpdateTemplateRequest): Promise<void>;
	delete(templateId: number): Promise<void>;

	setSearch(searchTerm: string): void;
	setSort(field: keyof Template, order: SortOrder): void;
	setSelectedPartner(partnerId?: Partner | null): void;
	setSelectedTemplate(template: Template | null): void;
}

export class TemplateStore implements ITemplateStore {
	private readonly notificationStore: NotificationStore;

	allTemplates: Loadable<Template[]> = [];

	searchTerm: string = "";
	sortField: keyof Template | null = null;
	sortOrder: SortOrder = "asc";
	selectedPartner: Partner | null = null;
	selectedTemplate: Template | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
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

		console.log("fetching templates");
		runInAction(() => (this.allTemplates = "loading"));

		const result = await tryRun(() => TemplateApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		console.log(data);
		runInAction(() => (this.allTemplates = data));
		console.log(`After fetching all templates: ${data.length}`);
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
		const result = await tryRun(() => TemplateApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.create"));
			return;
		}

		if (this.allTemplates !== "loading") {
			this.allTemplates = [result.data, ...this.allTemplates];
			this.selectedTemplate = result.data;
		}

		this.notificationStore.success("templates.success.create");
	}

	async update(request: UpdateTemplateRequest): Promise<void> {
		const result = await tryRun(() => TemplateApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates === "loading") {
				return;
			}

			this.allTemplates = this.allTemplates.map((el) => {
				if (el.id === result.data.id) {
					return result.data;
				}

				return el;
			});
		});
		this.notificationStore.success(translate("templates.success.update"));
	}

	async delete(templateId: number): Promise<void> {
		const result = await tryRun(() => TemplateApi.delete(templateId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("templates.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.filter((el) => el.id !== templateId);
			}
		});

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
}

export default TemplateStore;
