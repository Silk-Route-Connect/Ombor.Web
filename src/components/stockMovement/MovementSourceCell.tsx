import React from "react";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { MovementSourceRef } from "models/product";
import {
	isMovementSourceOpenable,
	movementSourceNumber,
	movementSourcePath,
} from "utils/movementSource";

interface MovementSourceCellProps {
	movement: MovementSourceRef;
	/** Opens a modal-only source (transfer, adjustment); routed sources link instead. */
	onOpen: (movement: MovementSourceRef) => void;
}

/**
 * The № of a stock-movement row: the sale / supply / refund number linking to
 * its page, a transfer or adjustment number opening its detail, «—» for opening
 * stock (no document).
 */
export const MovementSourceCell: React.FC<MovementSourceCellProps> = ({ movement, onOpen }) => {
	if (!isMovementSourceOpenable(movement)) {
		return <NoValue />;
	}
	const path = movementSourcePath(movement);
	return (
		<DocNumberCell
			number={movementSourceNumber(movement)}
			to={path ?? undefined}
			onOpen={path ? undefined : () => onOpen(movement)}
		/>
	);
};

export default MovementSourceCell;
