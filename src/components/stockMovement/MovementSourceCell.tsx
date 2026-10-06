import React from "react";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { MovementSourceRef } from "models/product";
import {
	isMovementSourceOpenable,
	movementSourceNumber,
	movementSourceOpensInPlace,
	movementSourcePath,
} from "utils/movementSource";

interface MovementSourceCellProps {
	movement: MovementSourceRef;
	/** Opens a transfer / adjustment detail over the page (a plain click on its link). */
	onOpen: (movement: MovementSourceRef) => void;
}

/**
 * The № of a stock-movement row, a link to its source document: a sale / supply
 * / refund page, or a transfer / adjustment (`/transfers/:id`, `/adjustments/:id`)
 * whose plain click opens its detail over the page; «—» for opening stock.
 */
export const MovementSourceCell: React.FC<MovementSourceCellProps> = ({ movement, onOpen }) => {
	if (!isMovementSourceOpenable(movement)) {
		return <NoValue />;
	}
	return (
		<DocNumberCell
			number={movementSourceNumber(movement)}
			to={movementSourcePath(movement) ?? undefined}
			onOpen={movementSourceOpensInPlace(movement) ? () => onOpen(movement) : undefined}
		/>
	);
};

export default MovementSourceCell;
