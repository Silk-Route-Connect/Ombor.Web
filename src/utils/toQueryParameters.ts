export function toQueryString<TRequest>(params: TRequest): string {
	if (!params) {
		return "";
	}

	return Object.entries(params)
		.filter(([, v]) => v !== undefined && v !== null && v !== "")
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
		.join("&");
}
