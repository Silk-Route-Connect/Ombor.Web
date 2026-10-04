import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MovementSourceRef } from "models/product";
import { useStore } from "stores/StoreContext";
import { isMovementSourceOpenable, movementSourcePath } from "utils/movementSource";

/** Opens a movement row's source: routes to a sale / supply / refund, a modal for the rest. */
export function useMovementSourceOpener(): (movement: MovementSourceRef) => void {
	const navigate = useNavigate();
	const { movementSourceStore } = useStore();

	return useCallback(
		(movement: MovementSourceRef) => {
			if (!isMovementSourceOpenable(movement)) {
				return;
			}
			const path = movementSourcePath(movement);
			if (path) {
				void navigate(path);
				return;
			}
			void movementSourceStore.open(movement);
		},
		[navigate, movementSourceStore],
	);
}

export default useMovementSourceOpener;
