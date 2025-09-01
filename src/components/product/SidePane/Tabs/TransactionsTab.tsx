import React, { useMemo } from "react";
import ProductTransactionsTable from "components/product/Table/ProductTransactionsTable";
import DownloadButton, { DownloadOptions } from "components/shared/Buttons/DownloadButton";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateUtils";
import { calculateLineTotals } from "utils/productUtils";

import { SxProps, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const TAB_DEFAULT_BODY_SX: SxProps<Theme> = {
	display: "flex",
	flexWrap: "wrap",
	justifyContent: "space-between",
	alignItems: "center",
	mb: 2,
	gap: 2,
};

interface TransactionsTabProps {
	mode: "Sale" | "Supply";
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ mode }) => {
	const { selectedProductStore } = useStore();

	const transactions = useMemo(
		() => (mode === "Sale" ? selectedProductStore.sales : selectedProductStore.supplies),
		[mode, selectedProductStore.sales, selectedProductStore.supplies],
	);

	const transactionsTotal = useMemo(() => {
		if (transactions === "loading") {
			return 0;
		}

		return transactions.reduce(
			(sum, current) =>
				calculateLineTotals(current.unitPrice, current.quantity, current.discount)
					.totalWithDiscount + sum,
			0,
		);
	}, [transactions]);

	const handleDownload = (option: DownloadOptions) => {
		console.log(option);
	};

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedProductStore.setCustom(filter.from, filter.to);
		} else {
			selectedProductStore.setPreset(filter.preset);
		}
	};

	const totalsTitle = useMemo(
		() => (mode === "Sale" ? translate("product.salesTotal") : translate("product.suppliesTotal")),
		[mode],
	);

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={TAB_DEFAULT_BODY_SX}>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedProductStore.dateFilter} onChange={handleDateChange} />
				</Box>

				<DownloadButton onDownload={handleDownload} />
			</Box>

			<ProductTransactionsTable mode={mode} data={transactions} pagination />

			<Box sx={{ mt: 2, textAlign: "right" }}>
				<Typography variant="subtitle1">
					{totalsTitle}: <strong>{transactionsTotal.toLocaleString()}</strong>
				</Typography>
			</Box>
		</Box>
	);
};

export default observer(TransactionsTab);
