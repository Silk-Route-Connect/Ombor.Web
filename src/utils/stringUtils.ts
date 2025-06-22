export function formatNotes(notes?: string | null, count: number = 30): string {
	if (!notes) {
		return "--";
	}

	if (notes.length > count) {
		return `${notes.substring(0, count)}...`;
	}

	return notes;
}
