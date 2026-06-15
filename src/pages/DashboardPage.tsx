import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AgingPanel from "components/dashboard/AgingPanel";
import ChartPanel from "components/dashboard/ChartPanel";
import DashboardKpiCards from "components/dashboard/DashboardKpiCards";
import DashboardWelcome, { WelcomeStep } from "components/dashboard/DashboardWelcome";
import { KassaSelection } from "components/dashboard/KassaFilter";
import KassaFilter from "components/dashboard/KassaFilter";
import {
	EASE,
	fadeUp,
	staggerChildrenSx,
	usePrefersReducedMotion,
} from "components/dashboard/motion";
import PaymentsChart from "components/dashboard/PaymentsChart";
import PeriodControl from "components/dashboard/PeriodControl";
import RecentTransactionsTable from "components/dashboard/RecentTransactionsTable";
import SalesSuppliesChart from "components/dashboard/SalesSuppliesChart";
import TopDebtorsPanel from "components/dashboard/TopDebtorsPanel";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { observer } from "mobx-react-lite";
import { DashboardRecentTransaction } from "models/dashboard";
import { partnerDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import { Box, CircularProgress, useTheme } from "@mui/material";

type ChartKind = "line" | "bar";

const DashboardPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const theme = useTheme();
	const { dashboardStore, debtStore, notificationStore } = useStore();

	const [salesType, setSalesType] = useState<ChartKind>("line");
	const [paymentsType, setPaymentsType] = useState<ChartKind>("bar");
	const [kassa, setKassa] = useState<KassaSelection>("all");
	const motion = !usePrefersReducedMotion();

	useEffect(() => {
		dashboardStore.load();
	}, [dashboardStore]);

	const state = dashboardStore.data;

	if (state === "loading" || state === null) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				{state === "loading" && <CircularProgress />}
			</Box>
		);
	}

	const data = state;
	const empty = dashboardStore.isEmpty;

	const periodSub = empty ? t("dashboard.newBusiness") : t(`dashboard.period.sub.${data.period}`);

	const goDebts = (card: "receivable" | "payable" | "overdue"): void => {
		debtStore.applyCard(card);
		navigate(PATHS.debts);
	};

	const onRecentRow = (tx: DashboardRecentTransaction): void => {
		notificationStore.info(
			t("dashboard.recent.open", {
				type: t(tx.type === "Sale" ? "dashboard.recent.sale" : "dashboard.recent.supply"),
				number: tx.id,
			}),
		);
	};

	const onWelcomeStep = (step: WelcomeStep): void => {
		if (step === "products") navigate(PATHS.products);
		else if (step === "partners") navigate(PATHS.partners);
		else navigate(PATHS.newSale);
	};

	return (
		<Box>
			<PageHeader
				title={t("dashboard.title")}
				subtitle={`${data.businessName} · ${periodSub}`}
				actions={<PeriodControl period={data.period} onChange={dashboardStore.setPeriod} />}
			/>

			{empty && <DashboardWelcome onStep={onWelcomeStep} />}

			<DashboardKpiCards
				data={data}
				onRevenue={() => navigate(PATHS.sales)}
				onReceivable={() => goDebts("receivable")}
				onPayable={() => goDebts("payable")}
				onOverdue={() => goDebts("overdue")}
			/>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", lg: "7fr 3fr" },
					gap: "16px",
					alignItems: "stretch",
					...staggerChildrenSx(4, motion, { base: 240 }),
				}}
			>
				<ChartPanel<ChartKind>
					title={t("dashboard.chart.salesSupplies.title")}
					subtitle={t("dashboard.chart.salesSupplies.sub")}
					legend={[
						{ label: t("dashboard.chart.sales"), color: theme.palette.primary.main },
						{ label: t("dashboard.chart.supplies"), color: theme.palette.secondary.main },
					]}
					chartType={salesType}
					onChartType={setSalesType}
					typeOptions={[
						{ value: "line", label: t("dashboard.chart.line") },
						{ value: "bar", label: t("dashboard.chart.bars") },
					]}
				>
					<SalesSuppliesChart series={data.series} chartType={salesType} />
				</ChartPanel>

				<AgingPanel
					aging={data.aging}
					receivableTotal={data.receivable.value}
					overdue={data.overdue.value}
					overdueCount={data.overdue.count}
				/>

				<ChartPanel<ChartKind>
					title={t("dashboard.chart.payments.title")}
					subtitle={t("dashboard.chart.payments.sub")}
					legend={[
						{ label: t("dashboard.chart.payin"), color: theme.palette.success.main },
						{ label: t("dashboard.chart.payout"), color: theme.palette.error.main },
					]}
					chartType={paymentsType}
					onChartType={setPaymentsType}
					typeOptions={[
						{ value: "bar", label: t("dashboard.chart.bars") },
						{ value: "line", label: t("dashboard.chart.netLine") },
					]}
					extra={<KassaFilter wallets={data.wallets} value={kassa} onChange={setKassa} />}
				>
					<PaymentsChart series={data.series} chartType={paymentsType} kassa={kassa} />
				</ChartPanel>

				<TopDebtorsPanel
					debtors={data.topDebtors}
					onOpenDebtor={(id) => navigate(partnerDetailPath(id))}
					onAllPartners={() => navigate(PATHS.partners)}
				/>
			</Box>

			<Box
				sx={
					motion
						? { animation: `${fadeUp} 460ms ${EASE} both`, animationDelay: "540ms" }
						: undefined
				}
			>
				<RecentTransactionsTable
					rows={data.recentTransactions}
					onSales={() => navigate(PATHS.sales)}
					onSupplies={() => navigate(PATHS.supplies)}
					onOrders={() => navigate(PATHS.orders)}
					onOpen={onRecentRow}
				/>
			</Box>
		</Box>
	);
});

export default DashboardPage;
