import { messages } from "./messages";

export type Lang = "ru" | "uz";

let current: Lang = "ru";

export function setLang(lang: Lang) {
	current = lang;
}

export function translate(key: keyof (typeof messages)[Lang]): string {
	return messages[current][key];
}
