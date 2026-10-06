import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AgingPanel from "components/dashboard/AgingPanel";
import DashboardKpiCards from "components/dashboard/DashboardKpiCards";
import { KassaSelection } from "components/dashboard/KassaFilter";
import KassaFilter from "components/dashboard/KassaFilter";
import { DashboardKpiKey } from "components/dashboard/KpiCards/types";
import LowStockPanel from "components/dashboard/LowStockPanel";
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
import GettingStartedCard from "components/onboarding/GettingStartedCard";
import { OnboardingStepKey } from "components/onboarding/onboardingSteps";
import ChartPanel from "components/shared/Chart/ChartPanel";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { useOpenLowStock } from "hooks/product/useOpenLowStock";
import { observer } from "mobx-react-lite";
import { DashboardRecentTransaction } from "models/dashboard";
import {
	partnerDetailPath,
	PATHS,
	reportPath,
	transactionDetailPath,
	warehouseDetailPath,
} from "routing/paths";
import { DebtCard } from "stores/DebtStore";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";

import { Box, CircularProgress, useTheme } from "@mui/material";

type ChartKind = "line" | "bar";

/** Where a KPI card leads: a «Долги» preset or the module page behind the figure. */
const KPI_TARGETS: Record<DashboardKpiKey, { debts: DebtCard } | { path: string }> = {
	revenue: { path: PATHS.sales },
	grossProfit: { path: reportPath("profit") },
	cash: { path: PATHS.wallets },
	stockValue: { path: PATHS.warehouses },
	receivable: { debts: "receivable" },
	payable: { debts: "payable" },
	overdue: { debts: "aged" },
};

const DashboardPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const theme = useTheme();
	const { dashboardStore, debtStore, onboardingStore, productStore } = useStore();

	const [salesType, setSalesType] = useState<ChartKind>("line");
	const [paymentsType, setPaymentsType] = useState<ChartKind>("bar");
	const [kassa, setKassa] = useState<KassaSelection>("all");
	const motion = !usePrefersReducedMotion();
	const openLowStock = useOpenLowStock();

	useEffect(() => {
		dashboardStore.load();
		void productStore.getAll();
	}, [dashboardStore, productStore]);

	const { data, isLoading } = dashboardStore;

	// Re-check the getting-started steps once per visit, as soon as the snapshot
	// (whose recent list answers «sold / supplied anything?») is in.
	const hasData = data !== null;
	useEffect(() => {
		if (dashboardStore.data) {
			void onboardingStore.refresh(dashboardStore.data.recentTransactions);
		}
	}, [hasData, dashboardStore, onboardingStore]);
	const period = dashboardStore.period;
	const empty = dashboardStore.isEmpty;

	const periodSub = empty ? t("dashboard.newBusiness") : t(`dashboard.period.sub.${period}`);

	const goDebts = (card: DebtCard): void => {
		debtStore.applyCard(card);
		navigate(PATHS.debts);
	};

	const onKpi = (card: DashboardKpiKey): void => {
		const target = KPI_TARGETS[card];
		if ("debts" in target) {
			goDebts(target.debts);
		} else {
			navigate(target.path);
		}
	};

	const onRecentRow = (tx: DashboardRecentTransaction): void => {
		navigate(transactionDetailPath(tx.type, tx.id));
	};

	const onSetupStep = (step: OnboardingStepKey): void => {
		const warehouseId = onboardingStore.singleWarehouseId;
		const target: Record<OnboardingStepKey, string> = {
			products: PATHS.products,
			stock: warehouseId != null ? warehouseDetailPath(warehouseId) : PATHS.warehouses,
			sale: PATHS.newSale,
			team: PATHS.settings,
		};
		navigate(target[step]);
	};

	return (
		<Box>
			<PageHeader
				title={t("dashboard.title")}
				subtitle={data ? `${data.businessName} · ${periodSub}` : undefined}
				actions={<PeriodControl period={period} onChange={dashboardStore.setPeriod} />}
			/>

			{data === null ? (
				<LoadStateView
					state={dashboardStore.loadError ?? "loading"}
					onRetry={dashboardStore.load}
					errorTitle={t("dashboard.error.load")}
				/>
			) : (
				<Box sx={{ position: "relative" }}>
					{isLoading && (
						<Box
							sx={{
								position: "absolute",
								inset: 0,
								zIndex: 2,
								display: "flex",
								justifyContent: "center",
								pt: 12,
								bgcolor: designTokens.loadingVeil,
							}}
						>
							<CircularProgress />
						</Box>
					)}

					<Box
						sx={{
							opacity: isLoading ? 0.55 : 1,
							transition: "opacity 150ms ease",
							pointerEvents: isLoading ? "none" : "auto",
						}}
					>
						{onboardingStore.visible && onboardingStore.progress && (
							<GettingStartedCard
								progress={onboardingStore.progress}
								doneCount={onboardingStore.doneCount}
								onStep={onSetupStep}
								onDismiss={onboardingStore.dismiss}
							/>
						)}

						<DashboardKpiCards data={data} onOpen={onKpi} />

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
								typeToggle={{
									value: salesType,
									onChange: setSalesType,
									options: [
										{ value: "line", label: t("dashboard.chart.line") },
										{ value: "bar", label: t("dashboard.chart.bars") },
									],
								}}
							>
								<SalesSuppliesChart series={data.series} chartType={salesType} />
							</ChartPanel>

							<AgingPanel
								aging={data.aging}
								receivableTotal={data.receivable.value}
								overdue={data.overdue.value}
							/>

							<ChartPanel<ChartKind>
								title={t("dashboard.chart.payments.title")}
								subtitle={t("dashboard.chart.payments.sub")}
								legend={[
									{ label: t("dashboard.chart.payin"), color: theme.palette.success.main },
									{ label: t("dashboard.chart.payout"), color: theme.palette.error.main },
								]}
								typeToggle={{
									value: paymentsType,
									onChange: setPaymentsType,
									options: [
										{ value: "bar", label: t("dashboard.chart.bars") },
										{ value: "line", label: t("dashboard.chart.netLine") },
									],
								}}
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
							<LowStockPanel
								products={productStore.allProducts}
								onRetry={() => void productStore.getAll()}
								onAll={openLowStock}
							/>
							<RecentTransactionsTable rows={data.recentTransactions} onOpen={onRecentRow} />
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
});

export default DashboardPage;
