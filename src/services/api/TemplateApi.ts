import {
	CreateTemplateRequest,
	GetTemplateByIdRequest,
	GetTemplatesRequest,
	Template,
	UpdateTemplateRequest,
} from "models/template";

import BaseApi from "./BaseApi";
import http from "./http";

class TemplateApi extends BaseApi {
	constructor() {
		super("/api/templates");
	}

	async getAll(request: GetTemplatesRequest): Promise<Template[]> {
		const url = this.getUrl(request);
		const response = await http.get<Template[]>(url);

		return response.data;
	}

	async getById(request: GetTemplateByIdRequest): Promise<Template> {
		const url = this.getUrlWithId(request.id);
		const response = await http.get<Template>(url);

		return response.data;
	}

	async create(request: CreateTemplateRequest): Promise<Template> {
		const response = await http.post<Template>(this.baseUrl, request);

		return response.data;
	}

	async update(request: UpdateTemplateRequest): Promise<Template> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Template>(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}
}

export default new TemplateApi();
