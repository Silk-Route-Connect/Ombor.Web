import { TFunction } from "i18next";

/**
 * Human-readable file size from a byte count (the served `sizeBytes`), with the
 * localized unit (`common.size.kb` / `common.size.mb`) — «248 КБ», «1.2 МБ»; any
 * positive value under 1 KB reads «1 КБ» (never «0 КБ» for a real file).
 */
export function formatBytes(t: TFunction, bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return t("common.size.kb", { value: 0 });
	}
	if (bytes >= 1_048_576) {
		return t("common.size.mb", { value: (bytes / 1_048_576).toFixed(1) });
	}
	return t("common.size.kb", { value: Math.max(1, Math.round(bytes / 1024)) });
}
