import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Names the browser tab «<title> · Ombor» while the caller is mounted, so tabs,
 * history and bookmarks tell pages apart («Продажа №392 · Ombor»); back to
 * «Ombor» on unmount. `null` leaves the tab title to an outer owner — a print
 * view names the tab after its PDF file (`PrintLayout`).
 */
export function useDocumentTitle(title: string | null): void {
	const { t } = useTranslation();
	const text = title === null ? null : t("common.documentTitle", { title });

	useEffect(() => {
		if (text === null) {
			return undefined;
		}
		document.title = text;
		return () => {
			document.title = t("common.appName");
		};
	}, [text, t]);
}
