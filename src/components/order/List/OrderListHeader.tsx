import React from "react";
import { useTranslation } from "react-i18next";
import OrderStatusTabs from "components/order/List/OrderStatusTabs";
import FilterDropdown from "components/partner/Detail/FilterDropdown";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { OrderDateRange } from "stores/OrderStore";
import { OrderStatusFilter } from "utils/orderUtils";

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

interface OrderListHeaderProps {
	searchValue: string;
	statusFilter: OrderStatusFilter;
	statusCounts: Record<OrderStatusFilter, number>;
	dateRange: OrderDateRange;
	onSearch: (value: string) => void;
	onStatusChange: (status: OrderStatusFilter) => void;
	onDateRangeChange: (range: OrderDateRange) => void;
	onCreate: () => void;
	onExport: () => void;
}

/**
 * Orders list header. Dataset-level actions (CSV export, New Order) on the title
 * row; view-shaping controls (search, status tabs, date range) on the row below
 * (locked pattern 11).
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
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("order.title")}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("order.exportCsv")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("order.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("order.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 300 } }}
				/>
				<OrderStatusTabs value={statusFilter} counts={statusCounts} onChange={onStatusChange} />
				<Box sx={{ flexGrow: 1 }} />
				<FilterDropdown<OrderDateRange>
					label={t("order.col.date")}
					icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />}
					value={dateRange}
					onChange={onDateRangeChange}
					options={[
						{ value: "all", label: t("order.range.all") },
						{ value: "7", label: t("order.range.7") },
						{ value: "30", label: t("order.range.30") },
						{ value: "90", label: t("order.range.90") },
					]}
				/>
			</Box>
		</>
	);
};

export default OrderListHeader;
