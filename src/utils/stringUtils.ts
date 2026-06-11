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

/**
 * Cyrillic→Latin transliteration map (Russian + common Uzbek letters). Used to
 * normalise text to a single script so search tolerates either alphabet.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
	а: "a",
	б: "b",
	в: "v",
	г: "g",
	д: "d",
	е: "e",
	ё: "yo",
	ж: "zh",
	з: "z",
	и: "i",
	й: "y",
	к: "k",
	л: "l",
	м: "m",
	н: "n",
	о: "o",
	п: "p",
	р: "r",
	с: "s",
	т: "t",
	у: "u",
	ф: "f",
	х: "kh",
	ц: "ts",
	ч: "ch",
	ш: "sh",
	щ: "sch",
	ъ: "",
	ы: "y",
	ь: "",
	э: "e",
	ю: "yu",
	я: "ya",
	// Uzbek Cyrillic extras
	ў: "o",
	қ: "q",
	ғ: "g",
	ҳ: "h",
};

/**
 * Normalises a string to lowercase Latin: case-folded and Cyrillic transliterated.
 * "Шоколад" and "Shokolad" both normalise to "shokolad".
 */
export function transliterateToLatin(input: string): string {
	return input
		.toLowerCase()
		.split("")
		.map((char) => CYRILLIC_TO_LATIN[char] ?? char)
		.join("");
}

/**
 * Cyrillic↔Latin tolerant substring match: a query typed in either script
 * matches text stored in the other. Empty/whitespace query matches everything.
 * Shared across list pages — the single source of search behaviour in v1.
 */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
	const normalizedQuery = transliterateToLatin(query).trim();
	if (!normalizedQuery) {
		return true;
	}

	return transliterateToLatin(text ?? "").includes(normalizedQuery);
}
