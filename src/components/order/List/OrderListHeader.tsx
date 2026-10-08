import React from "react";
import { useTranslation } from "react-i18next";
import OrderStatusTabs from "components/order/List/OrderStatusTabs";
import ExportButton from "components/shared/Buttons/ExportButton";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { DateRangeValue } from "utils/dateRange";
import { ORDER_DELIVERY_FILTERS, OrderDeliveryFilter, OrderStatusFilter } from "utils/orderUtils";

import AddIcon from "@mui/icons-material/Add";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Box } from "@mui/material";

interface OrderListHeaderProps {
	searchValue: string;
	statusFilter: OrderStatusFilter;
	statusCounts: Record<OrderStatusFilter, number>;
	dateRange: DateRangeValue;
	deliveryFilter: OrderDeliveryFilter;
	onSearch: (value: string) => void;
	onStatusChange: (status: OrderStatusFilter) => void;
	onDateRangeChange: (range: DateRangeValue) => void;
	onDeliveryChange: (filter: OrderDeliveryFilter) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

/**
 * Orders list header. Dataset-level actions (CSV export, New Order) on the title
 * row; view-shaping controls (search, status tabs, date range) on the row below
 * (locked pattern 11). From `lg` the filter row stays one line: the status tabs
 * give way and scroll sideways, so the delivery and date filters never drop to a
 * second row.
 */
export const OrderListHeader: React.FC<OrderListHeaderProps> = ({
	searchValue,
	statusFilter,
	statusCounts,
	dateRange,
	deliveryFilter,
	onSearch,
	onStatusChange,
	onDateRangeChange,
	onDeliveryChange,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("order.title")}
				icon={AssignmentOutlinedIcon}
				subtitle={t("page.intro.orders")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("order.create")}
						</PrimaryButton>
					</>
				}
			/>

			{/* Eight status tabs need ~900px: below xl they take a line of their own
			    under search and the filters, instead of hiding five statuses behind a fade. */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					mb: 2,
					flexWrap: { xs: "wrap", xl: "nowrap" },
				}}
			>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("order.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 350, xl: 280 }, flex: "0 0 auto" }}
				/>
				<Box
					sx={{
						display: "flex",
						flex: { xs: "1 1 100%", xl: "0 1 auto" },
						order: { xs: 1, xl: 0 },
						minWidth: 0,
						maxWidth: "100%",
					}}
				>
					<OrderStatusTabs value={statusFilter} counts={statusCounts} onChange={onStatusChange} />
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<Box sx={{ flex: "0 0 auto" }}>
					<EntityFilterSelect
						value={deliveryFilter}
						onChange={onDeliveryChange}
						label={t("order.filter.delivery.label")}
						icon={<LocalShippingOutlinedIcon />}
						options={ORDER_DELIVERY_FILTERS.map((value) => ({
							value,
							label: t(`order.filter.delivery.${value}`),
						}))}
					/>
				</Box>
				<Box sx={{ flex: "0 0 auto" }}>
					<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
				</Box>
			</Box>
		</>
	);
};

export default OrderListHeader;
