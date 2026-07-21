/**
 * The interface languages a user can switch between — the single source of truth
 * shared by the Topbar globe and the «Настройки» → Язык section (mvp-plan §18:
 * "the header globe switches the same per-user setting"). Both Uzbek locales are
 * registered in i18n/config.ts but deliberately omitted here until their resources
 * land — uz-Latn is only ~14% translated, so selecting it would silently fall back
 * to Russian. Re-add them here (one place) once the backfill is done.
 */
export type UiLanguage = {
	/** i18n locale code (SUPPORTED_LOCALES in i18n/config.ts). */
	code: string;
	/** Native autonym shown in the menu / radio card. */
	label: string;
};

export const UI_LANGUAGES: UiLanguage[] = [{ code: "ru", label: "Русский" }];
