import { useEffect, useState } from "react";

export function useFilePreviews(files: File[]): string[] {
	const [urls, setUrls] = useState<string[]>([]);

	useEffect(() => {
		if (files.length === 0) {
			setUrls([]);
			return;
		}

		const next = files.map((f) => URL.createObjectURL(f));
		setUrls(next);

		return () => next.forEach((u) => URL.revokeObjectURL(u));
	}, [files]);

	return urls;
}
