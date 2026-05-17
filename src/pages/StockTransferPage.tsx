import React, { useEffect, useMemo } from "react";
import StockTransferHeader from "components/stockTransfer/Header/StockTransferHeader";
import StockTransferTable from "components/stockTransfer/Table/StockTransferTable";
import TransferStockDialog from "components/warehouse/TransferStock/TransferStockDialog";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box } from "@mui/material";

const StockTransfersPage: React.FC = observer(() => {
	const { stockTransferStore, warehouseStore } = useStore();

	useEffect(() => {
		stockTransferStore.getAll();
		warehouseStore.getAll();
	}, [stockTransferStore, warehouseStore]);

	const transfersCount = useMemo(() => {
		if (stockTransferStore.filteredTransfers === "loading") {
			return "";
		}
		return stockTransferStore.filteredTransfers.length.toString();
	}, [stockTransferStore.filteredTransfers]);

	const dialogMode = stockTransferStore.dialogMode;

	return (
		<Box>
			<StockTransferHeader
				searchValue={stockTransferStore.searchTerm}
				titleCount={transfersCount}
				onSearch={stockTransferStore.setSearch}
				onCreate={stockTransferStore.openCreate}
			/>

			<StockTransferTable
				data={stockTransferStore.filteredTransfers}
				onSort={stockTransferStore.setSort}
			/>

			<TransferStockDialog
				isOpen={dialogMode.kind === "form"}
				isSaving={stockTransferStore.isSaving}
				fromWarehouse={null}
				onClose={stockTransferStore.closeDialog}
			/>
		</Box>
	);
});

export default StockTransfersPage;
