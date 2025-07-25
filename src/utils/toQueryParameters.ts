export function toQueryString<T extends Record<string, unknown>>(params: T): string {
	if (!params) {
		return "";
	}

	const parts: string[] = [];

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") {
			continue;
		}

		const push = (value: unknown) =>
			parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

		if (Array.isArray(value)) {
			value.forEach((v) => {
				if (v !== undefined && v !== null && v !== "") {
					push(v);
				}
			});
		} else {
			push(value);
		}
	}

	return parts.join("&");
}
