/**
 * Human-readable file size from a byte count (the served `sizeBytes`). Uses the
 * Russian unit abbreviations to match the UI locale — «248 КБ», «1.2 МБ»; any
 * positive value under 1 KB reads «1 КБ» (never «0 КБ» for a real file).
 */
export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "0 КБ";
	}
	if (bytes >= 1_048_576) {
		return `${(bytes / 1_048_576).toFixed(1)} МБ`;
	}
	return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}
