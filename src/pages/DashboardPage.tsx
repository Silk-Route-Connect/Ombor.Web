import React, { useEffect } from "react";
import AgingPanel from "components/dashboard/AgingPanel";
import DashboardHeader from "components/dashboard/DashboardHeader";
import DashboardKpiCard from "components/dashboard/DashboardKpiCard";
import PaymentsChart from "components/dashboard/PaymentsChart";
import RecentTransactionsPanel from "components/dashboard/RecentTransactionsPanel";
import SalesSuppliesChart from "components/dashboard/SalesSuppliesChart";
import TopDebtorsPanel from "components/dashboard/TopDebtorsPanel";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box, CircularProgress } from "@mui/material";

const DashboardPage: React.FC = observer(() => {
	const { dashboardStore, notificationStore } = useStore();

	useEffect(() => {
		dashboardStore.getSummary();
	}, [dashboardStore]);

	const summary = dashboardStore.summary;
	const subtitle = summary === "loading" ? "" : summary.periodSubtitle;

	const handleExport = () => notificationStore.success(translate("dashboard.export.toast"));

	return (
		<Box>
			<DashboardHeader
				subtitle={subtitle}
				period={dashboardStore.period}
				onPeriodChange={dashboardStore.setPeriod}
				onExport={handleExport}
			/>

			{summary === "loading" ? (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
					<CircularProgress />
				</Box>
			) : (
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
					{/* KPI row */}
					<Box
						sx={{
							display: "grid",
							gap: 2.5,
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
						}}
					>
						{summary.kpis.map((kpi) => (
							<DashboardKpiCard key={kpi.key} kpi={kpi} />
						))}
					</Box>

					{/* charts + side panels */}
					<Box
						sx={{
							display: "grid",
							gap: 2.5,
							gridTemplateColumns: { xs: "1fr", lg: "2.5fr 1.5fr" },
							alignItems: "stretch",
						}}
					>
						<SalesSuppliesChart series={summary.series} />
						<AgingPanel aging={summary.aging} />
						<PaymentsChart series={summary.series} wallets={summary.wallets} />
						<TopDebtorsPanel debtors={summary.topDebtors} />
					</Box>

					{/* recent transactions */}
					<RecentTransactionsPanel transactions={summary.recentTransactions} />
				</Box>
			)}
		</Box>
	);
});

export default DashboardPage;
