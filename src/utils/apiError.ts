import axios from "axios";

/**
 * Pulls a human-readable message out of a backend error response. The API
 * returns ASP.NET ProblemDetails / ValidationProblemDetails (docs/openapi.json):
 * `{ title, detail, errors: { field: string[] } }`. Returns undefined when no
 * usable message is present so callers can fall back to a translated default.
 */
export function getApiErrorMessage(error: unknown): string | undefined {
	if (!axios.isAxiosError(error)) {
		return undefined;
	}

	const data = error.response?.data as
		| { detail?: string; title?: string; errors?: Record<string, string[]> }
		| undefined;

	if (!data) {
		return undefined;
	}

	if (data.errors) {
		const messages = Object.values(data.errors).flat().filter(Boolean);
		if (messages.length > 0) {
			return messages.join(" ");
		}
	}

	return data.detail || data.title || undefined;
}
