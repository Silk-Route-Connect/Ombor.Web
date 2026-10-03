import React from "react";
import { useTranslation } from "react-i18next";
import OrderStatusTabs from "components/order/List/OrderStatusTabs";
import ExportButton from "components/shared/Buttons/ExportButton";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { OrderDateRange } from "stores/OrderStore";
import { OrderStatusFilter } from "utils/orderUtils";

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
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
	/** Rows the export would write (the filtered list). */
	exportCount: number;
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

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("order.searchPlaceholder")}
				/>
				<OrderStatusTabs value={statusFilter} counts={statusCounts} onChange={onStatusChange} />
				<Box sx={{ flexGrow: 1 }} />
				<EntityFilterSelect<OrderDateRange>
					label={t("order.col.date")}
					icon={<CalendarTodayOutlinedIcon />}
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
