import {
	AgingBucket,
	DashboardKpi,
	DashboardPeriod,
	DashboardSeriesPoint,
	DashboardSummary,
	DashboardWallet,
	RecentTransaction,
	TopDebtor,
} from "models/dashboard";

/* ============================================================
   Mock dashboard dataset.

   The dashboard backend is not implemented yet. This module
   produces a deterministic DashboardSummary so the UI can be
   built and reviewed. When the API is ready, delete this file
   and back DashboardApi with real `http` calls — the page and
   store consume the typed shape and won't need to change.
   ============================================================ */

const seeded = (n: number): number => {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const round10 = (n: number): number => Math.round(n / 10000) * 10000;

const PERIODS: Record<
	DashboardPeriod,
	{ labels: string[]; mul: number; subtitle: string; delta: string }
> = {
	today: {
		labels: ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
		mul: 360_000,
		subtitle: "Сегодня · по часам",
		delta: "+4.2%",
	},
	week: {
		labels: ["25.05", "26.05", "27.05", "28.05", "29.05", "30.05", "31.05"],
		mul: 1_850_000,
		subtitle: "Неделя · по дням",
		delta: "+8.1%",
	},
	month: {
		labels: ["01.05", "05.05", "09.05", "13.05", "17.05", "21.05", "25.05", "28.05", "31.05"],
		mul: 4_100_000,
		subtitle: "Май · по дням",
		delta: "+12.4%",
	},
};

/** Cash registers / accounts used to filter the payments chart. */
const WALLETS: DashboardWallet[] = [
	{ id: "cash-uzs", label: "Наличные UZS", icon: "cash" },
	{ id: "bank", label: "Банковский счёт", icon: "bank" },
	{ id: "cash-usd", label: "Наличные USD", icon: "cash" },
];

/** Split a total across the wallets with seeded, normalised weights. */
function splitWeights(s: number): number[] {
	const w = [0.5 + seeded(s), 0.45 + seeded(s + 1), 0.28 + seeded(s + 2)];
	const sum = w[0] + w[1] + w[2];
	return w.map((x) => x / sum);
}

function buildSeries(period: DashboardPeriod): DashboardSeriesPoint[] {
	const cfg = PERIODS[period];
	const pk = period.length * 7;
	return cfg.labels.map((label, i) => {
		const payin = round10((0.55 + seeded(i * 5 + 3 + pk)) * cfg.mul * 0.95);
		const payout = round10((0.46 + seeded(i * 5 + 4 + pk)) * cfg.mul * 0.95);
		const wi = splitWeights(i * 9 + 1 + pk);
		const wo = splitWeights(i * 9 + 5 + pk);
		return {
			label,
			sales: round10((0.7 + seeded(i * 5 + 1 + pk)) * cfg.mul),
			supplies: round10((0.52 + seeded(i * 5 + 2 + pk)) * cfg.mul),
			payin,
			payout,
			kin: wi.map((f) => round10(payin * f)),
			kout: wo.map((f) => round10(payout * f)),
		};
	});
}

/* Mock open debts — drive receivables/payables, aging and top debtors. */
interface MockDebt {
	partner: string;
	company: string;
	dir: "in" | "out"; // in = they owe us (receivable), out = we owe (payable)
	remaining: number;
	overdue: number; // days overdue (0 = not overdue)
}

const MOCK_DEBTS: MockDebt[] = [
	{
		partner: "Антонина Давыдова",
		company: 'ООО "Восток"',
		dir: "in",
		remaining: 4_820_000,
		overdue: 12,
	},
	{
		partner: "Артём Овчинников",
		company: 'ИП "Овчинников"',
		dir: "in",
		remaining: 3_640_000,
		overdue: 45,
	},
	{
		partner: "Дарья Морозова",
		company: 'ООО "Маркет+"',
		dir: "in",
		remaining: 2_310_000,
		overdue: 0,
	},
	{ partner: "Екатерина Калинина", company: "", dir: "in", remaining: 1_960_000, overdue: 8 },
	{
		partner: "Геннадий Зайцев",
		company: 'ООО "Зайцев и Ко"',
		dir: "in",
		remaining: 1_540_000,
		overdue: 33,
	},
	{
		partner: "Виктория Маркова",
		company: 'ИП "Маркова"',
		dir: "in",
		remaining: 980_000,
		overdue: 0,
	},
	{
		partner: "Никитин Сбыт",
		company: 'ООО "Никитин Сбыт"',
		dir: "out",
		remaining: 3_120_000,
		overdue: 0,
	},
	{
		partner: "Савин Трейд",
		company: 'ООО "Савин Трейд"',
		dir: "out",
		remaining: 1_870_000,
		overdue: 0,
	},
];

const RECENT: RecentTransaction[] = [
	{
		id: "t1",
		dateTime: "28.05 · 14:20",
		partner: "Антонина Давыдова",
		type: "sale",
		typeLabel: "Продажа",
		amount: 1_973_000,
		paid: 1_973_000,
		status: "paid",
	},
	{
		id: "t2",
		dateTime: "28.05 · 11:05",
		partner: "Никитин Сбыт",
		type: "supply",
		typeLabel: "Поставка",
		amount: 4_120_000,
		paid: 2_000_000,
		status: "part",
	},
	{
		id: "t3",
		dateTime: "27.05 · 17:48",
		partner: "Виктория Маркова",
		type: "supply",
		typeLabel: "Поставка",
		amount: 884_500,
		paid: 884_500,
		status: "paid",
	},
	{
		id: "t4",
		dateTime: "27.05 · 09:30",
		partner: "Артём Овчинников",
		type: "sale",
		typeLabel: "Продажа",
		amount: 1_296_730,
		paid: 0,
		status: "unpaid",
	},
	{
		id: "t5",
		dateTime: "26.05 · 16:12",
		partner: "Савин Трейд",
		type: "supply",
		typeLabel: "Поставка",
		amount: 2_431_000,
		paid: 2_431_000,
		status: "paid",
	},
	{
		id: "t6",
		dateTime: "26.05 · 10:02",
		partner: "Дарья Морозова",
		type: "sale",
		typeLabel: "Продажа",
		amount: 430_400,
		paid: 200_000,
		status: "part",
	},
	{
		id: "t7",
		dateTime: "25.05 · 15:40",
		partner: "Геннадий Зайцев",
		type: "sale",
		typeLabel: "Продажа",
		amount: 1_118_000,
		paid: 1_118_000,
		status: "paid",
	},
	{
		id: "t8",
		dateTime: "25.05 · 09:12",
		partner: "Екатерина Калинина",
		type: "sale",
		typeLabel: "Продажа",
		amount: 742_600,
		paid: 0,
		status: "unpaid",
	},
];

function buildSummary(period: DashboardPeriod): DashboardSummary {
	const cfg = PERIODS[period];
	const series = buildSeries(period);
	const revenue = series.reduce((s, p) => s + p.sales, 0);

	const receivables = MOCK_DEBTS.filter((d) => d.dir === "in");
	const payables = MOCK_DEBTS.filter((d) => d.dir === "out");
	const recvSum = receivables.reduce((s, d) => s + d.remaining, 0);
	const paybSum = payables.reduce((s, d) => s + d.remaining, 0);

	const overdue = receivables.filter((d) => d.overdue > 0);
	const overdueCount = overdue.length;
	const overduePartners = new Set(overdue.map((d) => d.partner)).size;

	// Aging buckets sum exactly to recvSum, escalating severity.
	const a0 = round10(recvSum * 0.17);
	const a1 = round10(recvSum * 0.33);
	const a2 = round10(recvSum * 0.28);
	const buckets: AgingBucket[] = [
		{ label: "0–7 дней", amount: a0, tone: "success" },
		{ label: "8–30 дней", amount: a1, tone: "primary" },
		{ label: "31–60 дней", amount: a2, tone: "warning" },
		{ label: "60+ дней", amount: recvSum - a0 - a1 - a2, tone: "error" },
	];
	const overdueAmount = buckets[2].amount + buckets[3].amount;

	const topDebtors: TopDebtor[] = receivables
		.map((d) => ({ name: d.partner, company: d.company, amount: d.remaining }))
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 5);

	const kpis: DashboardKpi[] = [
		{
			key: "revenue",
			caption: "Выручка",
			value: revenue,
			unit: "UZS",
			tone: "ink",
			deltaLabel: cfg.delta,
			deltaDirection: "up",
			subLabel: "к пред. периоду",
			spark: series.map((p) => p.sales),
		},
		{
			key: "receivable",
			caption: "Нам должны",
			value: recvSum,
			signed: true,
			tone: "positive",
			deltaLabel: "+5.1%",
			deltaDirection: "up",
			subLabel: `${receivables.length} открытых`,
			spark: [8, 9, 11, 10, 13, 12, 15, 14, 17, 18],
		},
		{
			key: "payable",
			caption: "Мы должны",
			value: -paybSum,
			signed: true,
			tone: "negative",
			deltaLabel: "−2.3%",
			deltaDirection: "down",
			subLabel: `${payables.length} открытых`,
			spark: [20, 18, 19, 16, 17, 15, 14, 15, 13, 12],
		},
		{
			key: "overdue",
			caption: "Просрочено",
			value: overdueAmount,
			unit: "UZS",
			tone: "warning",
			deltaLabel: `${overdueCount} транз.`,
			deltaDirection: "warn",
			subLabel: `${overduePartners} партнёров`,
			spark: [3, 4, 4, 5, 5, 6, 6, 7, 7, 7],
		},
	];

	return {
		period,
		periodSubtitle: cfg.subtitle,
		kpis,
		series,
		wallets: WALLETS,
		aging: { buckets, totalReceivable: recvSum, overdueAmount, overdueCount },
		topDebtors,
		recentTransactions: RECENT,
	};
}

/** Build a deterministic mock dashboard summary for the given period. */
export function getMockDashboardSummary(period: DashboardPeriod): DashboardSummary {
	return buildSummary(period);
}
