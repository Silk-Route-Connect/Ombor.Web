import { toQueryString } from "utils/toQueryParameters";

abstract class BaseApi {
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
