import { toQueryString } from "utils/toQueryParameters";

export const PrimitiveTypes = ["string", "number", "boolean", "bigint"] as readonly string[];

abstract class BaseApi {
	protected readonly formHeaders = {
		headers: {
			"Content-Type": "multipart/form-data",
			Accept: "application/json",
		},
	};
	protected readonly baseUrl: string;

	constructor(resourceUrl: string) {
		this.baseUrl = `/api/${resourceUrl}`;
	}

	protected getUrl<TRequest>(request?: TRequest): string {
		if (!request) {
			return this.baseUrl;
		}

		const query = toQueryString(request);

		return query ? `${this.baseUrl}?${query}` : this.baseUrl;
	}

	protected getUrlWithId(id: number): string {
		return `${this.baseUrl}/${id}`;
	}
}

export default BaseApi;
