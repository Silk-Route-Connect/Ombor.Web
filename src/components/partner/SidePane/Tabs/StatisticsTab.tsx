import React, { useMemo } from "react";
import { Box, Card, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import TimeSeriesChart from "components/shared/TimeSeriesChart/TimeSeriesChart";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { DashboardMetrics } from "models/dashboard";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateFilterUtils";
import { canHaveSales, canHaveSupplies } from "utils/partnerUtils";

import { TAB_DEFAULT_BODY_SX } from "./tabConfigs";

type StatisticsCardKey = "netBalance" | "transactionsCount" | "refundsCount" | "outstandingCount";

interface StatisticsCardDefinition {
	key: StatisticsCardKey;
	labelKey: `partner.statistics.${string}`;
	getValue: (context: { partnerBalance: number; metrics: DashboardMetrics }) => string | number;
}

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

					<Grid container spacing={2}>
						{canHaveSales(partner.type) && (
							<Grid size={{ xs: 12 }} key="sales-chart">
								<Card>
									<CardContent>
										<Typography variant="subtitle2">
											{translate("partner.statistics.salesOverTime")}
										</Typography>
										<TimeSeriesChart
											data={metrics.salesOverTime}
											filter={selectedPartnerStore.dateFilter}
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
											data={metrics.suppliesOverTime}
											filter={selectedPartnerStore.dateFilter}
										/>
									</CardContent>
								</Card>
							</Grid>
						)}
					</Grid>
				</>
			)}
		</Box>
	);
});

export default StatisticsTab;
