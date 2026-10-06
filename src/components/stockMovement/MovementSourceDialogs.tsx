import React, { useEffect } from "react";
import StockAdjustmentDetailModal from "components/stockAdjustment/Detail/StockAdjustmentDetailModal";
import TransferDetailModal from "components/transfer/Detail/TransferDetailModal";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

/** The transfer / adjustment detail a «Движения» row opened; closed when the tab unmounts. */
export const MovementSourceDialogs: React.FC = observer(() => {
	const { movementSourceStore } = useStore();
	const opened = movementSourceStore.opened;

	useEffect(() => () => movementSourceStore.close(), [movementSourceStore]);

	return (
		<>
			<TransferDetailModal
				transfer={opened?.kind === "transfer" ? opened.transfer : null}
				onClose={movementSourceStore.close}
			/>
			<StockAdjustmentDetailModal
				adjustment={opened?.kind === "adjustment" ? opened.adjustment : null}
				onClose={movementSourceStore.close}
			/>
		</>
	);
});

export default MovementSourceDialogs;
