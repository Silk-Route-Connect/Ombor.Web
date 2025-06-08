import {
	CreateTemplateRequest,
	GetTemplateByIdRequest,
	GetTemplatesRequest,
	Template,
	TemplateItem,
	UpdateTemplateRequest,
} from "models/template";

const MOCK_DELAY = () => new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

const _templates: Template[] = [
	{
		id: 1,
		name: "Дмитрий поставка регулярная",
		partnerName: "Дмитрий Георгиев",
		partnerId: 2,
		type: "supply",
		items: [
			{ id: 1, productId: 5, productName: "Paper", quantity: 10, unitPrice: 1.2, discount: 0 },
			{ id: 2, productId: 9, productName: "Ink", quantity: 2, unitPrice: 15, discount: 0 },
		],
	},
];

class TemplateApi {
	async getAll(request: GetTemplatesRequest): Promise<Template[]> {
		await MOCK_DELAY();
		return _templates.filter((t) => t.type === request.type);
	}

	async getById(request: GetTemplateByIdRequest): Promise<Template> {
		console.log(request);

		return null!;
	}

	async create(request: CreateTemplateRequest): Promise<Template> {
		await MOCK_DELAY();
		const id = Date.now();

		const items: TemplateItem[] = request.items.map(
			(i) =>
				({
					...i,
					productName: "",
				}) as TemplateItem,
		);
		const template: Template = {
			id,
			...request,
			partnerId: Math.random(),
			partnerName: "John Doe",
			items,
		};
		_templates.push(template);

		return template;
	}

	async update(request: UpdateTemplateRequest): Promise<Template> {
		console.log(request);

		return null!;
	}

	async delete(id: number): Promise<void> {
		console.log(id);
	}
}

export default new TemplateApi();
