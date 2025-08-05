import React, { useMemo } from "react";
import { Box, Card, CardContent, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import TimeSeriesChart from "components/shared/Charts/TimeSeriesChart/TimeSeriesChart";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { DashboardMetrics, TimeSeriesConfig, TimeSeriesPoint } from "models/dashboard";
import { useStore } from "stores/StoreContext";
import theme from "theme";
import { DateFilter } from "utils/dateFilterUtils";
import { canHaveSales, canHaveSupplies } from "utils/partnerUtils";

import { TAB_DEFAULT_BODY_SX } from "./tabConfigs";

type StatisticsCardKey = "netBalance" | "transactionsCount" | "refundsCount" | "outstandingCount";

type StatisticsCardDefinition = {
	key: StatisticsCardKey;
	labelKey: `partner.statistics.${string}`;
	getValue: (context: { partnerBalance: number; metrics: DashboardMetrics }) => string | number;
};

const CARD_DEFINITIONS: ReadonlyArray<StatisticsCardDefinition> = [
	{
		key: "netBalance",
		labelKey: "partner.statistics.netBalance",
		getValue: ({ partnerBalance }) => partnerBalance.toLocaleString(),
	},
	{
		key: "transactionsCount",
		labelKey: "partner.statistics.transactionsCount",
		getValue: ({ metrics }) => metrics.transactionCount,
	},
	{
		key: "refundsCount",
		labelKey: "partner.statistics.refundsCount",
		getValue: ({ metrics }) => metrics.refundCount,
	},
	{
		key: "outstandingCount",
		labelKey: "partner.statistics.outstandingCount",
		getValue: ({ metrics }) => metrics.outstandingCount,
	},
];

const salesSeries: TimeSeriesConfig[] = [
	{
		dataKey: "Sales",
		name: translate("partner.statistics.sales"),
		stroke: theme.palette.primary.main,
	},
	{
		dataKey: "Sale-Refunds",
		name: translate("partner.statistics.saleRefunds"),
		stroke: theme.palette.warning.main,
	},
];

const suppliesSeries: TimeSeriesConfig[] = [
	{
		dataKey: "Supplies",
		name: translate("partner.statistics.supplies"),
		stroke: theme.palette.primary.main,
	},
	{
		dataKey: "Supply-Refunds",
		name: translate("partner.statistics.supplyRefunds"),
		stroke: theme.palette.warning.main,
	},
];

const StatisticsTab: React.FC = observer(() => {
	const { selectedPartnerStore, partnerStore } = useStore();
	const partner = partnerStore.selectedPartner;
	const metrics = selectedPartnerStore.dashboardMetrics;

	if (!partner) {
		return null;
	}

	const handleDateChange = (filter: DateFilter) => {
		if (filter.type === "custom") {
			selectedPartnerStore.setCustom(filter.from, filter.to);
		} else {
			selectedPartnerStore.setPreset(filter.preset);
		}
	};

	const salesData: TimeSeriesPoint[] = useMemo(() => {
		if (metrics === "loading") {
			return [];
		}

		return metrics.salesOverTime.map((pt, i) => ({
			date: pt.date,
			Sales: pt.value,
			"Sale Refunds": metrics.saleRefundsOverTime[i]?.value ?? 0,
		}));
	}, [metrics]);

	const suppliesData: TimeSeriesPoint[] = useMemo(() => {
		if (metrics === "loading") {
			return [];
		}

		return metrics.suppliesOverTime.map((pt, i) => ({
			date: pt.date,
			Supplies: pt.value,
			"Supply Refunds": metrics.supplyRefundsOverTime[i]?.value ?? 0,
		}));
	}, [metrics]);

	const cards = useMemo(() => {
		if (metrics === "loading") {
			return CARD_DEFINITIONS.map((card) => ({
				label: translate(card.labelKey),
				value: "…",
			}));
		}

		return CARD_DEFINITIONS.map((card) => ({
			label: translate(card.labelKey),
			value: card.getValue({
				partnerBalance: partner.balance,
				metrics,
			}),
		}));
	}, [partner.balance, metrics]);

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={TAB_DEFAULT_BODY_SX}>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker value={selectedPartnerStore.dateFilter} onChange={handleDateChange} />
				</Box>
			</Box>

			{metrics === "loading" && (
				<Box sx={{ p: 2, textAlign: "center" }}>
					<CircularProgress />
				</Box>
			)}

			{metrics !== "loading" && (
				<>
					<Grid container spacing={2} sx={{ mb: 4 }}>
						{cards.map((c, idx) => (
							<Grid size={{ xs: 12, sm: 3 }} key={`${c.label}-${idx}`}>
								<Card>
									<CardContent>
										<Typography variant="subtitle2">{c.label}</Typography>
										<Typography variant="h6">{c.value}</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					<Stack spacing={2}>
						{canHaveSales(partner.type) && (
							<Grid size={{ xs: 12 }} key="sales-chart">
								<Card>
									<CardContent>
										<Typography variant="subtitle2">
											{translate("partner.statistics.salesOverTime")}
										</Typography>
										<TimeSeriesChart
											data={salesData}
											filter={selectedPartnerStore.dateFilter}
											seriesConfig={salesSeries}
										/>
									</CardContent>
								</Card>
							</Grid>
						)}

						{canHaveSupplies(partner.type) && (
							<Grid size={{ xs: 12 }} key="supplies-chart">
								<Card>
									<CardContent>
										<Typography variant="subtitle2">
											{translate("partner.statistics.suppliesOverTime")}
										</Typography>
										<TimeSeriesChart
											data={suppliesData}
											filter={selectedPartnerStore.dateFilter}
											seriesConfig={suppliesSeries}
										/>
									</CardContent>
								</Card>
							</Grid>
						)}
					</Stack>
				</>
			)}
		</Box>
	);
});

export default StatisticsTab;
