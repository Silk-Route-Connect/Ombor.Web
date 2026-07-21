import { Debt, DebtDirection } from "../../models/debt";

/**
 * In-memory seed for the Долги mock. There is no backend debts endpoint — the
 * page is a served, aggregated read model over unpaid / partially-paid
 * transactions, mocked here at the target v1 contract (docs/mocking.md).
 *
 * Self-contained (like the Partners ledger / Wallets / Payments mocks): the
 * outstanding transactions are seeded here and do NOT cross-reference the
 * Transactions mock — the document numbers are illustrative and a transaction-row
 * click only toasts. Partner ids DO match the Partners mock seed, so a
 * partner-row click deep-links to the real partner detail (the two mocks carry
 * independent figures, so the amounts there differ — a known mock limitation,
 * as in the prototype). Remaining / age / overdue are served (hard rule 8),
 * computed live against the current date so overdue states stay meaningful.
 */

const NET_TERMS_DAYS = 14;
const MS_PER_DAY = 86_400_000;

type DebtSeed = {
	number: number;
	direction: DebtDirection;
	partnerId: number;
	partnerName: string;
	partnerCompany: string | null;
	/** ISO transaction date. */
	date: string;
	total: number;
	paid: number;
};

const seed: DebtSeed[] = [
	{
		number: 1042,
		direction: "Receivable",
		partnerId: 4,
		partnerName: "Виктория",
		partnerCompany: "Орлова Сбыт",
		date: "2026-06-06",
		total: 2_340_000,
		paid: 1_200_000,
	},
	{
		number: 1038,
		direction: "Receivable",
		partnerId: 4,
		partnerName: "Виктория",
		partnerCompany: "Орлова Сбыт",
		date: "2026-05-22",
		total: 1_100_000,
		paid: 600_000,
	},
	{
		number: 1040,
		direction: "Receivable",
		partnerId: 8,
		partnerName: "Дима Мирзадова",
		partnerCompany: null,
		date: "2026-06-01",
		total: 1_650_000,
		paid: 0,
	},
	{
		number: 1036,
		direction: "Receivable",
		partnerId: 3,
		partnerName: "Артём Орехников",
		partnerCompany: null,
		date: "2026-05-16",
		total: 3_200_000,
		paid: 0,
	},
	{
		number: 1031,
		direction: "Receivable",
		partnerId: 6,
		partnerName: "Виктория Собянина",
		partnerCompany: null,
		date: "2026-05-23",
		total: 1_100_000,
		paid: 550_000,
	},
	{
		number: 2018,
		direction: "Payable",
		partnerId: 2,
		partnerName: "Парфёнова",
		partnerCompany: null,
		date: "2026-06-05",
		total: 1_280_000,
		paid: 0,
	},
	{
		number: 2017,
		direction: "Payable",
		partnerId: 5,
		partnerName: "Вероника",
		partnerCompany: null,
		date: "2026-06-02",
		total: 2_450_000,
		paid: 1_000_000,
	},
	{
		number: 2014,
		direction: "Payable",
		partnerId: 7,
		partnerName: "Геннадий Зайцев",
		partnerCompany: null,
		date: "2026-05-21",
		total: 1_750_000,
		paid: 0,
	},
];

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (later: Date, earlier: Date): number =>
	Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / MS_PER_DAY);

export function listDebts(): Debt[] {
	const today = new Date();

	return seed.map((s) => {
		const date = new Date(s.date);
		const due = new Date(date.getTime() + NET_TERMS_DAYS * MS_PER_DAY);
		const isReceivable = s.direction === "Receivable";
		return {
			transactionId: s.number,
			number: String(s.number),
			direction: s.direction,
			transactionType: isReceivable ? "Sale" : "Supply",
			partnerId: s.partnerId,
			partnerName: s.partnerName,
			partnerCompany: s.partnerCompany,
			// The «Тип» chip reflects the debt side (who owes whom).
			partnerType: isReceivable ? "Customer" : "Supplier",
			date: s.date,
			dueDate: due.toISOString(),
			total: s.total,
			paid: s.paid,
			remaining: s.total - s.paid,
			ageDays: daysBetween(today, date),
			overdueDays: daysBetween(today, due),
		};
	});
}
