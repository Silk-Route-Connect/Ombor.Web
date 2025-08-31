import { useEffect, useState } from "react";

export type MainImageSelection =
	| { kind: "existing"; imageId: number }
	| { kind: "new"; index: number };

/**
 * Keeps "main image" selection consistent when existing images or attachments change.
 */
export function useMainImageSelection(existingImages: { id: number }[], attachments: File[]) {
	const [mainImage, setMainImage] = useState<MainImageSelection | null>(null);

	useEffect(() => {
		// If current main no longer exists — clear it
		if (mainImage?.kind === "existing") {
			const stillExists = existingImages.some((i) => i.id === mainImage.imageId);
			if (!stillExists) {
				setMainImage(null);
			}
		} else if (mainImage?.kind === "new") {
			if (mainImage.index >= attachments.length) {
				setMainImage(null);
			}
		}

		// If nothing selected — pick first available in a stable order
		if (!mainImage) {
			if (existingImages.length > 0) {
				setMainImage({ kind: "existing", imageId: existingImages[0].id });
			} else if (attachments.length > 0) {
				setMainImage({ kind: "new", index: 0 });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingImages, attachments]);

	return { mainImage, setMainImage };
}
