import {
	DashboardAgingBucket,
	DashboardAgingBucketKey,
	DashboardData,
	DashboardDebtor,
	DashboardKpi,
	DashboardPeriod,
	DashboardRecentTransaction,
	DashboardSeriesPoint,
	DashboardWallet,
} from "../../models/dashboard";
import { listDebts } from "./debt";

/**
 * In-memory builder for the «Главное» (dashboard) mock. There is no backend
 * dashboard endpoint — it is a served, aggregated read model, mocked here at the
 * target v1 contract (docs/mocking.md).
 *
 * Reconciliation: the debt-derived figures (receivables, payables, aging, top
 * debtors) are computed from the SAME seed as the «Долги» mock (mocks/data/debt.ts
 * via listDebts()), so the dashboard and /debts agree on the headline totals —
 * the mvp-plan §2 "Done" criterion ("numbers reconcile with the underlying module
 * pages"). The time series + revenue are illustrative (deterministic pseudo-random
 * so they stay stable across reloads) — there is no event store to derive them
 * from in the mock. Recent transactions are a seeded preview; like the Долги /
 * Платежи mocks this resource is self-contained, so a recent-transaction row is
 * illustrative (the page only toasts on click).
 */

const BUSINESS_NAME = "Никитин Маркет";

const MS_PER_DAY = 86_400_000;

/* ----------------------------- helpers ----------------------------- */

// Deterministic [0,1) pseudo-random (the prototype's seeded() — stable per index).
const seeded = (n: number): number => {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const round10 = (n: number): number => Math.round(n / 10_000) * 10_000;
const pad = (n: number): string => n.toString().padStart(2, "0");
const dayLabel = (d: Date): string => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;

/* --------------------- per-period series config --------------------- */

type PeriodConfig = {
	/** Multiplier scaling the seeded magnitudes. */
	mul: number;
	/** % change vs the previous period for the revenue KPI. */
	revenueDelta: number;
	/** Builds the x-axis labels relative to `today`. */
	labels: (today: Date) => string[];
};

const PERIOD_CONFIG: Record<DashboardPeriod, PeriodConfig> = {
	today: {
		mul: 360_000,
		revenueDelta: 4.2,
		labels: () => ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
	},
	week: {
		mul: 1_850_000,
		revenueDelta: 8.1,
		labels: (today) =>
			Array.from({ length: 7 }, (_, i) =>
				dayLabel(new Date(today.getTime() - (6 - i) * MS_PER_DAY)),
			),
	},
	month: {
		mul: 4_100_000,
		revenueDelta: 12.4,
		// First day of the current month sampled every 3 days up to today.
		labels: (today) => {
			const start = new Date(today.getFullYear(), today.getMonth(), 1);
			const out: string[] = [];
			for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 3)) {
				out.push(dayLabel(new Date(d)));
			}
			return out;
		},
	},
};

/** Three self-contained money locations for the payments-chart filter. */
const WALLETS: DashboardWallet[] = [
	{ id: 1, name: "Наличные UZS", type: "cash" },
	{ id: 2, name: "Банковский счёт", type: "bank" },
	{ id: 3, name: "Наличные USD", type: "cash" },
];

// Split a magnitude across the three wallets with seeded, stable weights.
const splitWeights = (s: number): number[] => {
	const w = [0.5 + seeded(s), 0.45 + seeded(s + 1), 0.28 + seeded(s + 2)];
	const sum = w[0] + w[1] + w[2];
	return w.map((x) => x / sum);
};

function buildSeries(period: DashboardPeriod, today: Date): DashboardSeriesPoint[] {
	const cfg = PERIOD_CONFIG[period];
	const labels = cfg.labels(today);
	const pk = period.length * 7;

	return labels.map((label, i) => {
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
			walletPayin: wi.map((f) => round10(payin * f)),
			walletPayout: wo.map((f) => round10(payout * f)),
		};
	});
}

/* --------------------- debt-derived aggregates --------------------- */

const AGING_BUCKETS: DashboardAgingBucketKey[] = ["0-7", "8-30", "31-60", "60+"];

const bucketFor = (ageDays: number): DashboardAgingBucketKey => {
	if (ageDays <= 7) return "0-7";
	if (ageDays <= 30) return "8-30";
	if (ageDays <= 60) return "31-60";
	return "60+";
};

type DebtDerived = {
	receivable: number;
	receivableCount: number;
	payable: number;
	payableCount: number;
	overdue: number;
	overdueCount: number;
	overduePartners: number;
	aging: DashboardAgingBucket[];
	topDebtors: DashboardDebtor[];
};

/** Everything computed from the shared Долги seed so the screens reconcile. */
function deriveFromDebts(): DebtDerived {
	const debts = listDebts();
	const receivables = debts.filter((d) => d.direction === "Receivable");
	const payables = debts.filter((d) => d.direction === "Payable");

	const sumRemaining = (rows: typeof debts): number => rows.reduce((s, d) => s + d.remaining, 0);

	// Aging of receivables by real age (buckets sum to the receivable total).
	const aging: DashboardAgingBucket[] = AGING_BUCKETS.map((bucket) => ({
		bucket,
		amount: receivables
			.filter((d) => bucketFor(d.ageDays) === bucket)
			.reduce((s, d) => s + d.remaining, 0),
	}));

	// "Просрочено" = receivables aged 31+ days (the dashboard's aging banner).
	const aged = receivables.filter((d) => d.ageDays > 30);

	// Top debtors: receivables grouped by partner, largest outstanding first.
	const byPartner = new Map<number, DashboardDebtor>();
	for (const d of receivables) {
		const entry = byPartner.get(d.partnerId) ?? {
			partnerId: d.partnerId,
			name: d.partnerName,
			company: d.partnerCompany,
			amount: 0,
		};
		entry.amount += d.remaining;
		byPartner.set(d.partnerId, entry);
	}
	const topDebtors = [...byPartner.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);

	return {
		receivable: sumRemaining(receivables),
		receivableCount: receivables.length,
		payable: sumRemaining(payables),
		payableCount: payables.length,
		overdue: sumRemaining(aged),
		overdueCount: aged.length,
		overduePartners: new Set(aged.map((d) => d.partnerId)).size,
		aging,
		topDebtors,
	};
}

/* --------------------- recent transactions preview --------------------- */

type RecentSeed = [
	daysAgo: number,
	time: string,
	partner: string,
	type: "Sale" | "Supply",
	total: number,
	paid: number,
];

const RECENT_SEED: RecentSeed[] = [
	[0, "14:20", "Антонина Давыдова", "Sale", 1_973_000, 1_973_000],
	[0, "11:05", "Никитин Сбыт", "Supply", 4_120_000, 2_000_000],
	[1, "17:48", "Виктория Маркова", "Supply", 884_500, 884_500],
	[1, "09:30", "Артём Овчинников", "Sale", 1_296_730, 0],
	[2, "16:12", "Савин Трейд", "Supply", 2_431_000, 2_431_000],
	[2, "10:02", "Дарья Морозова", "Sale", 430_400, 200_000],
	[3, "15:40", "Геннадий Зайцев", "Sale", 1_118_000, 1_118_000],
	[3, "09:12", "Екатерина Калинина", "Sale", 742_600, 0],
];

function buildRecent(today: Date): DashboardRecentTransaction[] {
	return RECENT_SEED.map(([daysAgo, time, partnerName, type, total, paid], i) => {
		const day = new Date(today.getTime() - daysAgo * MS_PER_DAY);
		const [h, m] = time.split(":").map(Number);
		day.setHours(h, m, 0, 0);
		const status = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
		return {
			id: 5000 + i,
			date: day.toISOString(),
			partnerName,
			type,
			total,
			paid,
			status,
		};
	});
}

/* ----------------------------- assembly ----------------------------- */

export function getDashboard(period: DashboardPeriod): DashboardData {
	const today = new Date();
	const series = buildSeries(period, today);
	const cfg = PERIOD_CONFIG[period];
	const debts = deriveFromDebts();

	const revenue = series.reduce((s, p) => s + p.sales, 0);
	const revenueKpi: DashboardKpi = {
		value: revenue,
		deltaPct: cfg.revenueDelta,
		count: 0,
		trend: series.map((p) => p.sales),
	};

	return {
		businessName: BUSINESS_NAME,
		period,
		revenue: revenueKpi,
		receivable: {
			value: debts.receivable,
			deltaPct: 5.1,
			count: debts.receivableCount,
			trend: [8, 9, 11, 10, 13, 12, 15, 14, 17, 18],
		},
		payable: {
			value: debts.payable,
			deltaPct: -2.3,
			count: debts.payableCount,
			trend: [20, 18, 19, 16, 17, 15, 14, 15, 13, 12],
		},
		overdue: {
			value: debts.overdue,
			deltaPct: null,
			count: debts.overdueCount,
			partnerCount: debts.overduePartners,
			trend: [3, 4, 4, 5, 5, 6, 6, 7, 7, 7],
		},
		series,
		wallets: WALLETS,
		aging: debts.aging,
		topDebtors: debts.topDebtors,
		recentTransactions: buildRecent(today),
	};
}
