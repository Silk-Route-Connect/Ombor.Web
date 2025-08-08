import { useCallback, useState } from "react";

export function useDirtyClose(isDirty: boolean, isSaving: boolean, onClose: () => void) {
	const [discardOpen, setDiscardOpen] = useState(false);

	const requestClose = useCallback(() => {
		if (isSaving) {
			return;
		}

		if (isDirty) {
			setDiscardOpen(true);
		} else {
			onClose();
		}
	}, [isDirty, isSaving, onClose]);

	const confirmDiscard = useCallback(() => {
		setDiscardOpen(false);
		onClose();
	}, [onClose]);

	const cancelDiscard = useCallback(() => setDiscardOpen(false), []);

	return { discardOpen, requestClose, confirmDiscard, cancelDiscard };
}
