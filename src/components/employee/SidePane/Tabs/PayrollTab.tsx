import React, { useMemo } from "react";
import PayrollTable from "components/payroll/Table/PayrollTable";
import DownloadButton, { DownloadOptions } from "components/shared/Buttons/DownloadButton";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { TAB_DEFAULT_BODY_SX } from "components/shared/SidePane/tabConfigs";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateUtils";

import { Box, Typography } from "@mui/material";

interface PayrollTabProps {
	employeeId: number;
}

const PayrollTab: React.FC<PayrollTabProps> = observer(({ employeeId }) => {
	const { selectedEmployeeStore } = useStore();

	const handleDownload = (option: DownloadOptions) => {
		// TODO: Implement download logic later
		console.log(option);
	};

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedEmployeeStore.setCustom(filter.from, filter.to);
		} else {
			selectedEmployeeStore.setPreset(filter.preset);
		}
	};

	const totalAmount = useMemo(() => {
		const payments = selectedEmployeeStore.filteredPayrollHistory;

		if (payments === "loading") {
			return 0;
		}

		return payments.reduce((sum, p) => sum + p.amount, 0);
	}, [selectedEmployeeStore.filteredPayrollHistory]);

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={TAB_DEFAULT_BODY_SX}>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedEmployeeStore.dateFilter} onChange={handleDateChange} />
				</Box>

				<DownloadButton onDownload={handleDownload} />
			</Box>

			<PayrollTable data={selectedEmployeeStore.filteredPayrollHistory} mode="compact" />

			<Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
				<Typography variant="body2" color="text.secondary" fontWeight={600}>
					{translate("employee.payroll.totalAmount")}: {totalAmount.toLocaleString()}
				</Typography>
			</Box>
		</Box>
	);
});

export default PayrollTab;
