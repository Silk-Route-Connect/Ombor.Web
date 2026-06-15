/**
 * The interface languages a user can switch between — the single source of truth
 * shared by the Topbar globe and the «Настройки» → Язык section (mvp-plan §18:
 * "the header globe switches the same per-user setting"). `uz-Cyrl` is registered
 * in i18n/config.ts but deliberately omitted here until its resources land —
 * selecting it would fall back to Russian (the existing Topbar made the same
 * call). Add it here in one place when the backfill is done.
 */
export type UiLanguage = {
	/** i18n locale code (SUPPORTED_LOCALES in i18n/config.ts). */
	code: string;
	/** Native autonym shown in the menu / radio card. */
	label: string;
};

export const UI_LANGUAGES: UiLanguage[] = [
	{ code: "ru", label: "Русский" },
	{ code: "uz", label: "O‘zbekcha" },
];
