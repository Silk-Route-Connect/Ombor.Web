import { SortOrder } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateTemplateRequest,
	GetTemplateByIdRequest,
	GetTemplatesRequest,
	Template,
	TemplateType,
	UpdateTemplateRequest,
} from "models/template";
import TemplateApi from "services/api/TemplateApi";

import { NotificationStore } from "./NotificationStore";

export interface ITemplateStore {
	allTemplates: Loadable<Template[]>;
	filteredTemplates: Loadable<Template[]>;
	supplyTemplates: Loadable<Template[]>;
	saleTemplates: Loadable<Template[]>;
	search(searchTerm: string): void;
	sort(field: keyof Template, order: SortOrder): void;
	load(type?: TemplateType): Promise<void>;
	getById(templateId: number): Promise<Template | null>;
	create(request: CreateTemplateRequest): Promise<void>;
	update(request: UpdateTemplateRequest): Promise<void>;
	delete(templateId: number): Promise<void>;
}

export class TemplateStore implements ITemplateStore {
	private readonly notificationStore: NotificationStore;
	allTemplates: Loadable<Template[]> = [];
	isLoading = false;
	searchTerm: string = "";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get supplyTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		return this.allTemplates.filter((el) => el.type === "Supply");
	}

	get saleTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		return this.allTemplates.filter((el) => el.type === "Sale");
	}

	search(searchTerm: string): void {
		runInAction(() => (this.searchTerm = searchTerm));
	}

	sort(field: keyof Template, order: SortOrder): void {
		this.isLoading = field && order ? true : false;
	}

	get filteredTemplates(): Loadable<Template[]> {
		if (this.allTemplates === "loading") {
			return "loading";
		}

		let templates = this.allTemplates;

		if (this.searchTerm?.trim()) {
			templates = templates.filter((el) => el.name.includes(this.searchTerm));
		}

		return [...templates];
	}

	async load(type?: TemplateType) {
		if (this.allTemplates === "loading") {
			return;
		}

		runInAction(() => (this.allTemplates = "loading"));

		const request: GetTemplatesRequest = { type };
		const result = await tryRun(() => TemplateApi.getAll(request));
		console.log(result);

		if (result.status === "fail") {
			this.notificationStore.error("Could not load templates.");
			runInAction(() => (this.allTemplates = []));

			return;
		}

		runInAction(() => (this.allTemplates = result.data));
	}

	async getById(templateId: number): Promise<Template | null> {
		const request: GetTemplateByIdRequest = { id: templateId };
		const result = await tryRun(() => TemplateApi.getById(request));

		if (result.status === "fail") {
			this.notificationStore.error("There was an error loading template.");
			return null;
		}

		return result.data;
	}

	async create(request: CreateTemplateRequest): Promise<void> {
		const result = await tryRun(() => TemplateApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error("There was an error saving template.");
			return;
		}

		if (this.allTemplates !== "loading") {
			this.allTemplates.push(result.data);
		}
	}

	async update(request: UpdateTemplateRequest): Promise<void> {
		const result = await tryRun(() => TemplateApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error("There was an error updating template.");
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.map((el) => {
					if (el.id === result.data.id) {
						return result.data;
					}

					return el;
				});
			}
		});
	}

	async delete(templateId: number): Promise<void> {
		const result = await tryRun(() => TemplateApi.delete(templateId));

		if (result.status === "fail") {
			this.notificationStore.error("There was an error deleting template.");
			return;
		}

		runInAction(() => {
			if (this.allTemplates !== "loading") {
				this.allTemplates = this.allTemplates.filter((el) => el.id !== templateId);
			}
		});
	}
}

export default TemplateStore;
