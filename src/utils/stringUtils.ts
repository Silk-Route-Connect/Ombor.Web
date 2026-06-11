import i18next from "i18n/config";

export function formatNotes(notes?: string | null, count: number = 30): string {
	if (!notes) {
		return i18next.t("common.dash");
	}

	if (notes.length > count) {
		return `${notes.substring(0, count)}...`;
	}

	return notes;
}

export function isNullOrWhitespace(str?: string | null): boolean {
	if (!str) {
		return true;
	}

	return str.trim().length === 0;
}

export function valueOrPlaceholder(value?: string | null, placeholder?: string): string {
	if (!value || value.trim().length === 0) {
		return placeholder ?? i18next.t("common.dash");
	}

	return value;
}

export function isNumber(value?: string | null): boolean {
	if (!value) {
		return false;
	}

	return !isNaN(Number(value));
}
