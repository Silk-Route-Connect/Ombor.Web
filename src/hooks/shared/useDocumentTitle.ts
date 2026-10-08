import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Names the browser tab «<title> · Ombor» while the caller is mounted, so tabs,
 * history and bookmarks tell pages apart («Продажа №392 · Ombor»). On unmount
 * the title it replaced comes back — «Ombor» after a page, the page's own name
 * after a not-found dialog over it. `null` leaves the tab title to an outer
 * owner — a print view names the tab after its PDF file (`PrintLayout`).
 */
export function useDocumentTitle(title: string | null): void {
	const { t } = useTranslation();
	const text = title === null ? null : t("common.documentTitle", { title });

	useEffect(() => {
		if (text === null) {
			return undefined;
		}
		const previous = document.title;
		document.title = text;
		return () => {
			document.title = previous;
		};
	}, [text]);
}
