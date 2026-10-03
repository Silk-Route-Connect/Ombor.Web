import React from "react";
import { useTranslation } from "react-i18next";
import OrderStatusTabs from "components/order/List/OrderStatusTabs";
import ExportButton from "components/shared/Buttons/ExportButton";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { DateRangeValue } from "utils/dateRange";
import { OrderStatusFilter } from "utils/orderUtils";

import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/material";

interface OrderListHeaderProps {
	searchValue: string;
	statusFilter: OrderStatusFilter;
	statusCounts: Record<OrderStatusFilter, number>;
	dateRange: DateRangeValue;
	onSearch: (value: string) => void;
	onStatusChange: (status: OrderStatusFilter) => void;
	onDateRangeChange: (range: DateRangeValue) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

/**
 * Orders list header. Dataset-level actions (CSV export, New Order) on the title
 * row; view-shaping controls (search, status tabs, date range) on the row below
 * (locked pattern 11). From `lg` the filter row stays one line: the status tabs
 * give way and scroll sideways, so the date filter never drops to a second row.
 */
export const OrderListHeader: React.FC<OrderListHeaderProps> = ({
	searchValue,
	statusFilter,
	statusCounts,
	dateRange,
	onSearch,
	onStatusChange,
	onDateRangeChange,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("order.title")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("order.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					mb: 2,
					flexWrap: { xs: "wrap", lg: "nowrap" },
				}}
			>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("order.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 350, lg: 260 }, flex: "0 0 auto" }}
				/>
				<Box sx={{ display: "flex", flex: "0 1 auto", minWidth: 0, maxWidth: "100%" }}>
					<OrderStatusTabs value={statusFilter} counts={statusCounts} onChange={onStatusChange} />
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<Box sx={{ flex: "0 0 auto" }}>
					<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
				</Box>
			</Box>
		</>
	);
};

export default OrderListHeader;
