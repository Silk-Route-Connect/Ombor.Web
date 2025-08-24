import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { TimeSeriesConfig, TimeSeriesPoint } from "models/dashboard";
import { ProductTransaction } from "models/product";
import { TransactionType } from "models/transaction";
import { getKeyFromDate, toDate } from "utils/dateUtils";
import { calculateProductTransactionTotal } from "utils/productUtils";

type TrendPoint = { value: number };

const asArray = <T>(loadable: Loadable<T[]>): T[] => (loadable === "loading" ? [] : loadable);
const sumBy = (items: number[]) => items.reduce((acc, v) => acc + v, 0);
const isRefund = (type: TransactionType) => type === "SaleRefund" || type === "SupplyRefund";

const toTrend = (values: number[], points = 8): TrendPoint[] => {
	if (values.length === 0) {
		return [];
	}

	const trimmed = values.length <= points ? values : values.slice(-points);
	return trimmed.map((value) => ({ value }));
};

export interface ProductReportsMetrics {
	// KPIs
	transactionsCount: number;
	refundsCount: number;
	totalQuantitySold: number;
	totalRevenueApprox: number;
	trendTransactions: TrendPoint[];
	trendRefunds: TrendPoint[];
	trendQuantity: TrendPoint[];
	trendRevenue: TrendPoint[];

	// Chart
	chartData: TimeSeriesPoint[];
	chartSeries: TimeSeriesConfig[];

	// Raw (already flattened)
	allTransactions: ProductTransaction[];
}

export function useProductReportsMetrics(
	salesLoadable: Loadable<ProductTransaction[]>,
	suppliesLoadable: Loadable<ProductTransaction[]>,
	saleRefundsLoadable: Loadable<ProductTransaction[]>,
	supplyRefundsLoadable: Loadable<ProductTransaction[]>,
): ProductReportsMetrics {
	const theme = useTheme();

	const sales = asArray(salesLoadable);
	const supplies = asArray(suppliesLoadable);
	const saleRefunds = asArray(saleRefundsLoadable);
	const supplyRefunds = asArray(supplyRefundsLoadable);

	const allTransactions = useMemo(
		() => [...sales, ...supplies, ...saleRefunds, ...supplyRefunds],
		[sales, supplies, saleRefunds, supplyRefunds],
	);

	const sortedTransactions = useMemo(
		() => [...allTransactions].sort((a, b) => +toDate(a.date) - +toDate(b.date)),
		[allTransactions],
	);

	// KPIs
	const transactionsCount = sales.length + supplies.length;
	const refundsCount = saleRefunds.length + supplyRefunds.length;
	const totalQuantitySold = sumBy(sales.map((t) => t.quantity ?? 0));
	const totalRevenueApprox =
		sumBy(sales.map(calculateProductTransactionTotal)) -
		sumBy(saleRefunds.map(calculateProductTransactionTotal));

	// Trends
	const trendTransactions = toTrend(
		sortedTransactions.map((t) => (isRefund(t.transactionType) ? 0 : 1)),
	);
	const trendRefunds = toTrend(
		sortedTransactions.map((t) => (isRefund(t.transactionType) ? 1 : 0)),
	);
	const trendQuantity = toTrend(sales.map((t) => t.quantity ?? 0));
	const trendRevenue = toTrend(sales.map((t) => calculateProductTransactionTotal(t)));

	// Chart series (counts per day)
	const chartLabels = {
		transactions: translate("product.reports.sales"),
		refunds: translate("product.reports.saleRefunds"),
	};

	const { chartData, chartSeries } = useMemo(() => {
		const bucket = new Map<string, { transactions: number; refunds: number }>();

		allTransactions.forEach((transaction) => {
			const key = getKeyFromDate(toDate(transaction.date));
			const row = bucket.get(key) ?? { transactions: 0, refunds: 0 };

			if (transaction.transactionType === "Sale" || transaction.transactionType === "Supply") {
				row.transactions += 1;
			} else if (isRefund(transaction.transactionType)) {
				row.refunds += 1;
			}

			bucket.set(key, row);
		});

		const data: TimeSeriesPoint[] = Array.from(bucket.entries())
			.sort(([a], [b]) => (a < b ? -1 : 1))
			.map(([date, v]) => ({ date, transactions: v.transactions, refunds: v.refunds }));

		const series: TimeSeriesConfig[] = [
			{
				dataKey: "transactions",
				name: chartLabels.transactions,
				stroke: theme.palette.primary.main,
			},
			{
				dataKey: "refunds",
				name: chartLabels.refunds,
				strokeDasharray: "6 4",
				stroke: theme.palette.warning.main,
			},
		];

		return { chartData: data, chartSeries: series };
	}, [allTransactions, chartLabels.transactions, chartLabels.refunds, theme.palette]);

	return {
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
		allTransactions,
	};
}
