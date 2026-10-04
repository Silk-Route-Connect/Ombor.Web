import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MovementSourceRef } from "models/product";
import { useStore } from "stores/StoreContext";
import {
	isMovementSourceOpenable,
	movementSourceOpensInPlace,
	movementSourcePath,
} from "utils/movementSource";

/** Opens a movement row's source: a transfer / adjustment modal over the page, else its page. */
export function useMovementSourceOpener(): (movement: MovementSourceRef) => void {
	const navigate = useNavigate();
	const { movementSourceStore } = useStore();

	return useCallback(
		(movement: MovementSourceRef) => {
			if (!isMovementSourceOpenable(movement)) {
				return;
			}
			if (movementSourceOpensInPlace(movement)) {
				void movementSourceStore.open(movement);
				return;
			}
			const path = movementSourcePath(movement);
			if (path) {
				void navigate(path);
			}
		},
		[navigate, movementSourceStore],
	);
}

export default useMovementSourceOpener;
