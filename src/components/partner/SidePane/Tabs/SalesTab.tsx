import React, { useEffect } from "react";
import { Box } from "@mui/material";
import DownloadButton, { DownloadOptions } from "components/shared/Buttons/DownloadButton";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { TransactionsTable } from "components/transaction/Table/TransactionsTable";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateFilterUtils";

import { TAB_DEFAULT_BODY_SX } from "./tabConfigs";

interface SalesTabProps {
	partnerId: number;
}

const SalesTab: React.FC<SalesTabProps> = observer(({ partnerId }) => {
	const { selectedPartnerStore } = useStore();

	useEffect(() => {
		if (partnerId) {
			selectedPartnerStore.getTransactions("Sale");
		}
	}, [partnerId, selectedPartnerStore]);

	const handleDownload = (option: DownloadOptions) => {
		console.log(option);
	};

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedPartnerStore.setCustom(filter.from, filter.to);
		} else {
			selectedPartnerStore.setPreset(filter.preset);
		}
	};

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={TAB_DEFAULT_BODY_SX}>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedPartnerStore.dateFilter} onChange={handleDateChange} />
				</Box>

				<DownloadButton onDownload={handleDownload} />
			</Box>

			<TransactionsTable rows={selectedPartnerStore.sales} pagination mode="compact" />
		</Box>
	);
});

export default SalesTab;
