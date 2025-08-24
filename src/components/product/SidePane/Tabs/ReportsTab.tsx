import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import KpiCard from "components/shared/Cards/KpiCard";
import TimeSeriesChart from "components/shared/Charts/TimeSeriesChart/TimeSeriesChart";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { useProductReportsMetrics } from "hooks/product/useProductReports";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateFilterUtils";

const ReportsTab: React.FC = observer(() => {
	const { selectedProductStore } = useStore();

	const {
		transactionsCount,
		refundsCount,
		totalQuantitySold,
		totalRevenueApprox,
		trendTransactions,
		trendRefunds,
		trendQuantity,
		trendRevenue,
		chartData,
		chartSeries,
	} = useProductReportsMetrics(
		selectedProductStore.sales,
		selectedProductStore.supplies,
		selectedProductStore.saleRefunds,
		selectedProductStore.supplyRefunds,
	);

	const kpiItems = useMemo(
		() => [
			{
				key: "transactions",
				label: translate("product.reports.transactions"),
				value: transactionsCount.toLocaleString("ru-RU"),
				trend: trendTransactions,
			},
			{
				key: "refunds",
				label: translate("product.reports.refunds"),
				value: refundsCount.toLocaleString("ru-RU"),
				trend: trendRefunds,
			},
			{
				key: "quantity-sold",
				label: translate("product.reports.quantitySold"),
				value: totalQuantitySold.toLocaleString("ru-RU"),
				trend: trendQuantity,
			},
			{
				key: "revenue",
				label: translate("product.reports.revenue"),
				value: totalRevenueApprox.toLocaleString("ru-RU"),
				trend: trendRevenue,
			},
		],
		[
			transactionsCount,
			refundsCount,
			totalQuantitySold,
			totalRevenueApprox,
			trendTransactions,
			trendRefunds,
			trendQuantity,
			trendRevenue,
		],
	);

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedProductStore.setCustom(filter.from, filter.to);
		} else {
			selectedProductStore.setPreset(filter.preset);
		}
	};

	return (
		<Box sx={{ p: 2 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					gap: 2,
				}}
			>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedProductStore.dateFilter} onChange={handleDateChange} />
				</Box>
			</Box>

			<Grid container spacing={2} sx={{ mb: 3 }}>
				{kpiItems.map((item) => (
					<Grid key={item.key} size={{ xs: 12, sm: 6, md: 3 }}>
						<KpiCard {...item} />
					</Grid>
				))}
			</Grid>

			<Grid container spacing={2}>
				<Grid size={{ xs: 12 }}>
					<Card>
						<CardContent>
							<TimeSeriesChart
								title={translate("product.reports.transactionsOverTime")}
								data={chartData}
								filter={selectedProductStore.dateFilter}
								seriesConfig={chartSeries}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
});

export default ReportsTab;
