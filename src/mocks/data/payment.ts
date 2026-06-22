import { PartnerType } from "../../models/partner";
import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentAllocationEntry,
	PaymentEmployeeRef,
	PaymentFormData,
	PaymentPartnerRef,
	PaymentRecord,
	PaymentSource,
	PaymentWalletRef,
} from "../../models/payment";
import { WalletType } from "../../models/wallet";

/**
 * In-memory seed + mutation for the redesigned Платежи mock. The backend
 * `/api/payments` DTO is the legacy removed-enum model (method / currency /
 * exchangeRate), stale for the redesign (business-rules §B uses Wallet/Advance
 * sources + canon allocation types), so the standalone page is mocked here at
 * the target v1 contract (docs/mocking.md). Mutations persist within a session
 * and reset on reload.
 *
 * Self-contained (like the Partners ledger / Wallets / Orders mocks): the
 * reference data (partners with served balance + advance, employees, wallets)
 * and each partner's outstanding transactions are seeded here and do NOT
 * cross-reference the other mocks. Creating a payment prepends the record and
 * adjusts the served figures it touches (outstanding paid, partner advance /
 * balance, wallet balance) so the create modal stays consistent within a
 * session. Partner balances / advances / wallet balances are served, never
 * recomputed client-side (rule 12).
 */

const AUTHOR = "Бахром Саидов";

/* ───────────────────────── reference data ───────────────────────── */

type WalletSeed = { id: number; name: string; type: WalletType; balance: number };
const wallets: WalletSeed[] = [
	{ id: 1, name: "Основная касса", type: "Cash", balance: 4_200_000 },
	{ id: 2, name: "Терминал", type: "Card", balance: 1_850_000 },
	{ id: 3, name: "Расчётный счёт", type: "Bank", balance: 12_400_000 },
];

type EmployeeSeed = { id: number; name: string; position: string; salary: number };
const employees: EmployeeSeed[] = [
	{ id: 1, name: "Бахром Саидов", position: "Директор", salary: 8_000_000 },
	{ id: 2, name: "Дилноза Каримова", position: "Продавец-кассир", salary: 3_500_000 },
	{ id: 3, name: "Азиз Рахматов", position: "Кладовщик", salary: 3_000_000 },
];

type PartnerSeed = {
	id: number;
	name: string;
	type: PartnerType;
	balance: number;
	advance: number;
};
const partners: PartnerSeed[] = [
	{ id: 1, name: "Виктория", type: "Customer", balance: 1_850_000, advance: 0 },
	{ id: 2, name: "Вероника", type: "Supplier", balance: -2_400_000, advance: 0 },
	{ id: 3, name: "Геннадий Зайцев", type: "Both", balance: 320_000, advance: 0 },
	{ id: 4, name: "Артём Орехников", type: "Customer", balance: 0, advance: 400_000 },
	{ id: 5, name: "Дима Мирзадова", type: "Customer", balance: 520_000, advance: 0 },
];

/** Outstanding transactions per partner id (drives the settlement modal). */
type OutstandingSeed = OutstandingTransaction & { partnerId: number };
const outstanding: OutstandingSeed[] = [
	{
		partnerId: 1,
		id: 1038,
		date: "2026-05-28",
		type: "Sale",
		total: 1_100_000,
		paid: 600_000,
		remaining: 500_000,
	},
	{
		partnerId: 1,
		id: 1042,
		date: "2026-06-06",
		type: "Sale",
		total: 2_340_000,
		paid: 1_200_000,
		remaining: 1_140_000,
	},
	{
		partnerId: 2,
		id: 2017,
		date: "2026-06-02",
		type: "Supply",
		total: 2_400_000,
		paid: 1_400_000,
		remaining: 1_000_000,
	},
	{
		partnerId: 3,
		id: 1051,
		date: "2026-06-07",
		type: "Sale",
		total: 880_000,
		paid: 0,
		remaining: 880_000,
	},
	{
		partnerId: 5,
		id: 1036,
		date: "2026-05-21",
		type: "Sale",
		total: 1_260_000,
		paid: 480_000,
		remaining: 780_000,
	},
];

const walletById = (id: number) => wallets.find((w) => w.id === id);
const partnerById = (id: number) => partners.find((p) => p.id === id);
const employeeById = (id: number) => employees.find((e) => e.id === id);

/* ───────────────────────── payments seed ───────────────────────── */

let nextSourceId = 1;
let nextAllocId = 1;

function walletSource(walletId: number, amount: number): PaymentSource {
	const w = walletById(walletId)!;
	return {
		id: nextSourceId++,
		sourceType: "Wallet",
		walletId: w.id,
		walletName: w.name,
		walletType: w.type,
		amount,
	};
}

function settlement(transactionId: number, amount: number): PaymentAllocationEntry {
	return {
		id: nextAllocId++,
		allocationType: "TransactionSettlement",
		transactionId,
		amount,
	};
}
function advanceCredit(amount: number): PaymentAllocationEntry {
	return {
		id: nextAllocId++,
		allocationType: "AdvanceCredit",
		transactionId: null,
		amount,
	};
}

let payments: PaymentRecord[] = [
	{
		id: 520,
		number: "P-520",
		date: "2026-06-08",
		type: "Transaction",
		direction: "Income",
		partnerId: 1,
		partnerName: "Виктория",
		partnerType: "Customer",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 1,
		walletName: "Основная касса",
		walletType: "Cash",
		amount: 1_200_000,
		allocationSummary: "к #1042, #1038 + аванс",
		description: null,
		period: null,
		salary: null,
		createdBy: AUTHOR,
		sources: [walletSource(1, 1_200_000)],
		allocations: [settlement(1042, 800_000), settlement(1038, 200_000), advanceCredit(200_000)],
	},
	{
		id: 519,
		number: "P-519",
		date: "2026-06-07",
		type: "Payroll",
		direction: "Expense",
		partnerId: null,
		partnerName: null,
		partnerType: null,
		employeeId: 2,
		employeeName: "Дилноза Каримова",
		employeePosition: "Продавец-кассир",
		walletId: 3,
		walletName: "Расчётный счёт",
		walletType: "Bank",
		amount: 3_500_000,
		allocationSummary: "Зарплата · Июнь 2026",
		description: null,
		period: "Июнь 2026",
		salary: 3_500_000,
		createdBy: AUTHOR,
		sources: [walletSource(3, 3_500_000)],
		allocations: [],
	},
	{
		id: 518,
		number: "P-518",
		date: "2026-06-06",
		type: "Deposit",
		direction: "Income",
		partnerId: 3,
		partnerName: "Геннадий Зайцев",
		partnerType: "Both",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 1,
		walletName: "Основная касса",
		walletType: "Cash",
		amount: 500_000,
		allocationSummary: "Аванс",
		description: null,
		period: null,
		salary: null,
		createdBy: "Малика Усманова",
		sources: [walletSource(1, 500_000)],
		allocations: [advanceCredit(500_000)],
	},
	{
		id: 517,
		number: "P-517",
		date: "2026-06-05",
		type: "General",
		direction: "Expense",
		partnerId: null,
		partnerName: null,
		partnerType: null,
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 1,
		walletName: "Основная касса",
		walletType: "Cash",
		amount: 2_800_000,
		allocationSummary: "Аренда офиса июнь",
		description: "Аренда офиса июнь",
		period: null,
		salary: null,
		createdBy: AUTHOR,
		sources: [walletSource(1, 2_800_000)],
		allocations: [],
	},
	{
		id: 516,
		number: "P-516",
		date: "2026-06-04",
		type: "Transaction",
		direction: "Expense",
		partnerId: 2,
		partnerName: "Вероника",
		partnerType: "Supplier",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 3,
		walletName: "Расчётный счёт",
		walletType: "Bank",
		amount: 1_000_000,
		allocationSummary: "к #2017",
		description: null,
		period: null,
		salary: null,
		createdBy: "Малика Усманова",
		sources: [walletSource(3, 1_000_000)],
		allocations: [settlement(2017, 1_000_000)],
	},
	{
		id: 515,
		number: "P-515",
		date: "2026-06-03",
		type: "Withdrawal",
		direction: "Expense",
		partnerId: 4,
		partnerName: "Артём Орехников",
		partnerType: "Customer",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 1,
		walletName: "Основная касса",
		walletType: "Cash",
		amount: 200_000,
		allocationSummary: "Возврат аванса",
		description: null,
		period: null,
		salary: null,
		createdBy: AUTHOR,
		sources: [walletSource(1, 200_000)],
		allocations: [],
	},
	{
		id: 514,
		number: "P-514",
		date: "2026-06-01",
		type: "Payroll",
		direction: "Expense",
		partnerId: null,
		partnerName: null,
		partnerType: null,
		employeeId: 1,
		employeeName: "Бахром Саидов",
		employeePosition: "Директор",
		walletId: 3,
		walletName: "Расчётный счёт",
		walletType: "Bank",
		amount: 8_000_000,
		allocationSummary: "Зарплата · Июнь 2026",
		description: null,
		period: "Июнь 2026",
		salary: 8_000_000,
		createdBy: "Малика Усманова",
		sources: [walletSource(3, 8_000_000)],
		allocations: [],
	},
	{
		id: 513,
		number: "P-513",
		date: "2026-05-30",
		type: "Transaction",
		direction: "Income",
		partnerId: 5,
		partnerName: "Дима Мирзадова",
		partnerType: "Customer",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 2,
		walletName: "Терминал",
		walletType: "Card",
		amount: 780_000,
		allocationSummary: "к #1036 (частично)",
		description: null,
		period: null,
		salary: null,
		createdBy: AUTHOR,
		sources: [walletSource(2, 780_000)],
		allocations: [settlement(1036, 780_000)],
	},
	{
		id: 512,
		number: "P-512",
		date: "2026-05-28",
		type: "Transaction",
		direction: "Income",
		partnerId: 1,
		partnerName: "Виктория",
		partnerType: "Customer",
		employeeId: null,
		employeeName: null,
		employeePosition: null,
		walletId: 2,
		walletName: "Терминал",
		walletType: "Card",
		amount: 500_000,
		allocationSummary: "к #1038",
		description: null,
		period: null,
		salary: null,
		createdBy: AUTHOR,
		sources: [walletSource(2, 500_000)],
		allocations: [settlement(1038, 500_000)],
	},
];

let nextPaymentNumber = 521;

/* ───────────────────────── queries ───────────────────────── */

export function listPayments(): PaymentRecord[] {
	return [...payments].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id);
}

export function findPayment(id: number): PaymentRecord | undefined {
	return payments.find((p) => p.id === id);
}

export function paymentFormData(): PaymentFormData {
	const partnerRefs: PaymentPartnerRef[] = partners.map((p) => ({
		id: p.id,
		name: p.name,
		type: p.type,
		balance: p.balance,
		advance: p.advance,
	}));
	const employeeRefs: PaymentEmployeeRef[] = employees.map((e) => ({
		id: e.id,
		name: e.name,
		position: e.position,
		salary: e.salary,
	}));
	const walletRefs: PaymentWalletRef[] = wallets.map((w) => ({
		id: w.id,
		name: w.name,
		type: w.type,
		balance: w.balance,
	}));
	return { partners: partnerRefs, employees: employeeRefs, wallets: walletRefs };
}

export function listOutstanding(partnerId: number): OutstandingTransaction[] {
	return outstanding
		.filter((o) => o.partnerId === partnerId && o.remaining > 0)
		.map(({ partnerId: _pid, ...rest }) => rest)
		.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

/* ───────────────────────── create (mutation) ───────────────────────── */

export function addPayment(req: CreatePaymentRecordRequest): PaymentRecord {
	const wallet = walletById(req.walletId)!;
	const partner = req.partnerId != null ? partnerById(req.partnerId) : undefined;
	const employee = req.employeeId != null ? employeeById(req.employeeId) : undefined;

	const id = nextPaymentNumber++;
	const allocations: PaymentAllocationEntry[] = [];
	let summary = "";

	if (req.type === "Transaction") {
		let settledTotal = 0;
		for (const s of req.settlements) {
			const row = outstanding.find((o) => o.id === s.transactionId);
			allocations.push(settlement(s.transactionId, s.amount));
			settledTotal += s.amount;
			if (row) {
				row.paid += s.amount;
				row.remaining = Math.max(0, row.total - row.paid);
			}
		}
		const advance = Math.max(0, req.amount - settledTotal);
		if (advance > 0) {
			allocations.push(advanceCredit(advance));
			if (partner) partner.advance += advance;
		}
		const refs = req.settlements.map((s) => `#${s.transactionId}`).join(", ");
		summary = refs ? `к ${refs}${advance > 0 ? " + аванс" : ""}` : "Аванс";
		// Settlements move the partner balance toward zero.
		if (partner) {
			partner.balance += req.direction === "Income" ? -settledTotal : settledTotal;
		}
	} else if (req.type === "Deposit") {
		allocations.push(advanceCredit(req.amount));
		summary = "Аванс";
		if (partner) partner.advance += req.amount;
	} else if (req.type === "Withdrawal") {
		summary = "Возврат аванса";
		if (partner) partner.advance = Math.max(0, partner.advance - req.amount);
	} else if (req.type === "Payroll") {
		summary = `Зарплата · ${req.period ?? ""}`;
	} else {
		summary = req.description ?? "";
	}

	// Wallet balance reflects the cash moved (Income in, Expense out).
	wallet.balance += req.direction === "Income" ? req.amount : -req.amount;

	const record: PaymentRecord = {
		id,
		number: `P-${id}`,
		date: new Date().toISOString(),
		type: req.type,
		direction: req.direction,
		partnerId: partner?.id ?? null,
		partnerName: partner?.name ?? null,
		partnerType: partner?.type ?? null,
		employeeId: employee?.id ?? null,
		employeeName: employee?.name ?? null,
		employeePosition: employee?.position ?? null,
		walletId: wallet.id,
		walletName: wallet.name,
		walletType: wallet.type,
		amount: req.amount,
		allocationSummary: summary,
		description: req.type === "General" ? (req.description ?? null) : null,
		period: req.type === "Payroll" ? (req.period ?? null) : null,
		salary: req.type === "Payroll" ? (employee?.salary ?? req.amount) : null,
		createdBy: AUTHOR,
		sources: [walletSource(wallet.id, req.amount)],
		allocations,
	};

	payments = [record, ...payments];
	return record;
}
