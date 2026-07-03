import {
	CreateRefundRequest,
	TransactionAttachment,
	TransactionLine,
	TransactionPaymentLine,
	TransactionRecord,
	TransactionType,
} from "../../models/transaction";
import { WalletType } from "../../models/wallet";
import { lineNet, statusOf, txTotal } from "../../utils/transactionUtils";

/**
 * In-memory seed + mutation for the Transactions mock (Sales + Supplies + their
 * refunds). The redesigned pages need a `GET /{id}` detail, a unified feed with
 * computed totals + payment status + line counts, per-line discount TYPE, refund
 * linkage (original ref + reason + per-line cap), createdBy and warehouse — none
 * of which the live `/api/transactions` contract serves (tech-change-list: not
 * started) — so the read side is mocked here at the target v1 contract
 * (docs/mocking.md). Seed ported from the design's sales-data.jsx / supplies-data.jsx;
 * every total is COMPUTED from line items so each screen reconciles.
 *
 * All four types — sales, supplies and their refunds — are created through the
 * single `POST /api/transactions` (mocked here, discriminated by `type`).
 * Refunds don't mutate Products stock (known mock limitation, like Transfers).
 */

/** Partner ids align with the Partners mock so the detail's partner link resolves. */
const PARTNER_ID: Record<string, number> = {
	"Антонина Давыдова": 1,
	Парфёнова: 2,
	"Артём Орехников": 3,
	Виктория: 4,
	Вероника: 5,
	"Виктория Собянина": 6,
	"Геннадий Зайцев": 7,
	"Дима Мирзадова": 8,
	"Фарход Каримов": 9,
};

const WAREHOUSE = "Центральный склад";

type SeedDisc = { type: "pct" | "fix"; v: number } | null;
type SeedLine = { name: string; unit: string; qty: number; price: number; disc?: SeedDisc };
type SeedPayment = { id: string; date: string; method: string; amount: number };
type SeedAttachment = { name: string; type: "pdf" | "img"; size: string };

type SeedTxn = {
	number: string;
	date: string; // dd.mm.yyyy
	time: string;
	partner: string;
	createdBy: string;
	lines: SeedLine[];
	payments?: SeedPayment[];
	note?: string;
	attachments?: SeedAttachment[];
};

type SeedRefund = {
	number: string;
	refNumber: string; // original transaction number
	date: string;
	time: string;
	partner: string;
	createdBy: string;
	reason: string;
	lines: { name: string; unit: string; qty: number; price: number }[];
};

/* ───────────────────────────── date helper ───────────────────────────── */
const isoOf = (ddmmyyyy: string): string => {
	const [d, m, y] = ddmmyyyy.split(".");
	return `${y}-${m}-${d}`;
};
const pad = (n: number) => String(n).padStart(2, "0");
const todayIso = (): string => {
	const now = new Date();
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const nowTime = (): string => {
	const now = new Date();
	return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/* ───────────────────────────── seed: sales ───────────────────────────── */
const SALES: SeedTxn[] = [
	{
		number: "1042",
		date: "06.06.2026",
		time: "14:32",
		partner: "Антонина Давыдова",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 50, price: 15000 },
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 30, price: 32000, disc: { type: "pct", v: 10 } },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 20, price: 28000 },
			{
				name: "Шоколад Молочный 100г",
				unit: "шт",
				qty: 15,
				price: 8500,
				disc: { type: "pct", v: 5 },
			},
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 5, price: 18000 },
			{
				name: "Большой Хлопковый Шарф",
				unit: "шт",
				qty: 1,
				price: 67000,
				disc: { type: "fix", v: 5000 },
			},
		],
		payments: [{ id: "P-512", date: "05.06.2026", method: "Наличные", amount: 1200000 }],
		note: "Клиент просил отгрузить до конца недели. Чай зелёный 100г не включён — нет на складе на момент продажи.",
		attachments: [
			{ name: "Накладная №1042.pdf", type: "pdf", size: "248 КБ" },
			{ name: "Фото получения.jpg", type: "img", size: "1,2 МБ" },
		],
	},
	{
		number: "1041",
		date: "03.06.2026",
		time: "11:08",
		partner: "Виктория",
		createdBy: "Малика Юсупова",
		lines: [
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 10, price: 32000 },
			{ name: "Кофе молотый 250г", unit: "шт", qty: 6, price: 45000 },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 10, price: 30000 },
		],
		payments: [{ id: "P-509", date: "03.06.2026", method: "Наличные", amount: 890000 }],
	},
	{
		number: "1040",
		date: "01.06.2026",
		time: "16:45",
		partner: "Дима Мирзадова",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 40, price: 15000 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 20, price: 18000 },
			{ name: "Гречка ядрица 1кг", unit: "кг", qty: 15, price: 16000 },
			{ name: "Молоко 1л", unit: "шт", qty: 30, price: 9000 },
			{ name: "Соль пищевая 1кг", unit: "кг", qty: 30, price: 6000 },
		],
	},
	{
		number: "1039",
		date: "28.05.2026",
		time: "10:20",
		partner: "Геннадий Зайцев",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 10, price: 28000 },
			{
				name: "Шоколад Молочный 100г",
				unit: "шт",
				qty: 40,
				price: 8500,
				disc: { type: "pct", v: 10 },
			},
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 25, price: 15000 },
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 15, price: 32000 },
			{
				name: "Мука пшеничная 2кг",
				unit: "кг",
				qty: 10,
				price: 18000,
				disc: { type: "pct", v: 5 },
			},
			{ name: "Большой Хлопковый Шарф", unit: "шт", qty: 2, price: 67000 },
		],
		payments: [{ id: "P-498", date: "28.05.2026", method: "Перевод", amount: 1746000 }],
	},
	{
		number: "1038",
		date: "22.05.2026",
		time: "09:14",
		partner: "Виктория Собянина",
		createdBy: "Малика Юсупова",
		lines: [
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 15, price: 32000 },
			{ name: "Шоколад Молочный 100г", unit: "шт", qty: 20, price: 8500 },
			{ name: "Кофе молотый 250г", unit: "шт", qty: 6, price: 45000 },
			{ name: "Печенье овсяное 300г", unit: "шт", qty: 12, price: 15000 },
		],
		payments: [{ id: "P-471", date: "22.05.2026", method: "Наличные", amount: 600000 }],
	},
	{
		number: "1037",
		date: "18.05.2026",
		time: "13:50",
		partner: "Парфёнова",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 10, price: 28000 },
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 20, price: 14000 },
		],
		payments: [{ id: "P-455", date: "18.05.2026", method: "Карта", amount: 560000 }],
	},
	{
		number: "1036",
		date: "15.05.2026",
		time: "15:02",
		partner: "Артём Орехников",
		createdBy: "Малика Юсупова",
		lines: [
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 25, price: 32000 },
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 30, price: 15000 },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 20, price: 28000 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 20, price: 18000 },
			{ name: "Кофе молотый 250г", unit: "шт", qty: 6, price: 45000 },
			{ name: "Гречка ядрица 1кг", unit: "кг", qty: 15, price: 16000 },
			{ name: "Шоколад Молочный 100г", unit: "шт", qty: 20, price: 8500 },
			{ name: "Большой Хлопковый Шарф", unit: "шт", qty: 5, price: 70000 },
		],
	},
];

/* ──────────────────────────── seed: supplies ─────────────────────────── */
const SUPPLIES: SeedTxn[] = [
	{
		number: "2018",
		date: "05.06.2026",
		time: "15:10",
		partner: "Парфёнова",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 20, price: 27000 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 20, price: 14000 },
			{ name: "Гречка ядрица 1кг", unit: "кг", qty: 20, price: 16000 },
			{ name: "Соль пищевая 1кг", unit: "кг", qty: 35, price: 4000 },
		],
	},
	{
		number: "2017",
		date: "02.06.2026",
		time: "11:24",
		partner: "Вероника",
		createdBy: "Малика Юсупова",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 40, price: 12500 },
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 20, price: 27000, disc: { type: "pct", v: 5 } },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 20, price: 22500 },
			{ name: "Шоколад Молочный 100г", unit: "шт", qty: 75, price: 6200 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 15, price: 14000 },
			{ name: "Соль пищевая 1кг", unit: "кг", qty: 78, price: 4000 },
		],
		payments: [{ id: "P-731", date: "02.06.2026", method: "Банк", amount: 1000000 }],
		note: "Партия по предзаказу. Рис со скидкой −5% по договорённости. Остаток оплаты — после сверки накладной.",
		attachments: [
			{ name: "Накладная №2017.pdf", type: "pdf", size: "264 КБ" },
			{ name: "Счёт-фактура.pdf", type: "pdf", size: "188 КБ" },
		],
	},
	{
		number: "2016",
		date: "30.05.2026",
		time: "09:48",
		partner: "Артём Орехников",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 30, price: 22500 },
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 50, price: 12500 },
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 15, price: 27000 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 30, price: 14000 },
			{ name: "Шоколад Молочный 100г", unit: "шт", qty: 50, price: 6200 },
			{ name: "Гречка ядрица 1кг", unit: "кг", qty: 20, price: 16000 },
			{ name: "Соль пищевая 1кг", unit: "кг", qty: 40, price: 4000 },
			{ name: "Кофе молотый 250г", unit: "шт", qty: 5, price: 37000 },
		],
		payments: [{ id: "P-708", date: "30.05.2026", method: "Банк", amount: 3100000 }],
	},
	{
		number: "2015",
		date: "25.05.2026",
		time: "13:05",
		partner: "Парфёнова",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 40, price: 12500 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 15, price: 14000 },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 8, price: 22500 },
		],
		payments: [{ id: "P-684", date: "25.05.2026", method: "Перевод", amount: 890000 }],
	},
	{
		number: "2014",
		date: "20.05.2026",
		time: "10:32",
		partner: "Геннадий Зайцев",
		createdBy: "Малика Юсупова",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 40, price: 12500 },
			{ name: "Рис Басмати 1кг", unit: "кг", qty: 20, price: 27000 },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 12, price: 22500 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 20, price: 14000 },
			{ name: "Соль пищевая 1кг", unit: "кг", qty: 40, price: 4000 },
		],
	},
	{
		number: "2013",
		date: "15.05.2026",
		time: "16:20",
		partner: "Вероника",
		createdBy: "Бахром Саидов",
		lines: [
			{ name: "Сахар-рафинад 1кг", unit: "кг", qty: 28, price: 12500 },
			{ name: "Мука пшеничная 2кг", unit: "кг", qty: 15, price: 14000 },
		],
		payments: [{ id: "P-651", date: "15.05.2026", method: "Наличные", amount: 560000 }],
	},
];

const REFUNDS: SeedRefund[] = [
	{
		number: "1039-R1",
		refNumber: "1039",
		date: "28.05.2026",
		time: "18:40",
		partner: "Геннадий Зайцев",
		createdBy: "Бахром Саидов",
		reason: "Брак — повреждённая упаковка при доставке",
		lines: [
			{ name: "Шоколад Молочный 100г", unit: "шт", qty: 5, price: 7650 },
			{ name: "Масло подсолнечное 1л", unit: "шт", qty: 3, price: 28000 },
		],
	},
	{
		number: "2016-R1",
		refNumber: "2016",
		date: "30.05.2026",
		time: "17:55",
		partner: "Артём Орехников",
		createdBy: "Бахром Саидов",
		reason: "Повреждение при транспортировке",
		lines: [{ name: "Масло подсолнечное 1л", unit: "шт", qty: 8, price: 22500 }],
	},
];

/* ───────────────────────────── build records ─────────────────────────── */
let nextId = 1;
let nextLineId = 1;

function buildLines(txId: number, seed: SeedLine[]): TransactionLine[] {
	return seed.map((l) => {
		const discountType = l.disc ? (l.disc.type === "pct" ? "Percentage" : "Fixed") : undefined;
		const discount = l.disc ? l.disc.v : 0;
		const line: TransactionLine = {
			id: nextLineId++,
			productId: 0,
			productName: l.name,
			transactionId: txId,
			unitPrice: l.price,
			quantity: l.qty,
			discount,
			discountType,
			unit: l.unit,
			total: 0,
		};
		line.total = lineNet(line);
		return line;
	});
}

/** Map the seed's legacy method label to the reshaped wallet (name + type). */
const methodToWallet = (method: string): { walletName: string; walletType: WalletType } => {
	if (method === "Карта") return { walletName: "Карта", walletType: "Card" };
	if (method === "Перевод" || method === "Банк") return { walletName: method, walletType: "Bank" };
	return { walletName: "Наличные", walletType: "Cash" };
};

let nextPaymentId = 1;
const toPayments = (txId: number, seed: SeedPayment[] | undefined): TransactionPaymentLine[] =>
	(seed ?? []).map((p) => {
		const wallet = methodToWallet(p.method);
		return {
			id: nextPaymentId++,
			transactionId: txId,
			paymentNumber: p.id,
			amount: p.amount,
			walletName: wallet.walletName,
			walletType: wallet.walletType,
			date: isoOf(p.date),
		};
	});

const toAttachments = (seed: SeedAttachment[] | undefined): TransactionAttachment[] =>
	(seed ?? []).map((a) => ({ name: a.name, kind: a.type, size: a.size }));

function buildTxn(seed: SeedTxn, type: TransactionType): TransactionRecord {
	const id = nextId++;
	const lines = buildLines(id, seed.lines);
	const totalDue = txTotal(lines);
	const payments = toPayments(id, seed.payments);
	const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
	return {
		id,
		transactionNumber: seed.number,
		type,
		date: new Date(isoOf(seed.date)),
		time: seed.time,
		partnerId: PARTNER_ID[seed.partner] ?? 0,
		partnerName: seed.partner,
		warehouseName: WAREHOUSE,
		createdBy: seed.createdBy,
		lines,
		totalDue,
		totalPaid,
		remaining: Math.max(totalDue - totalPaid, 0),
		status: statusOf(totalDue, totalPaid),
		payments,
		attachments: toAttachments(seed.attachments),
		notes: seed.note || undefined,
	};
}

function buildRefund(
	seed: SeedRefund,
	originalId: number,
	type: TransactionType,
): TransactionRecord {
	const id = nextId++;
	const lines: TransactionLine[] = seed.lines.map((l) => ({
		id: nextLineId++,
		productId: 0,
		productName: l.name,
		transactionId: id,
		unitPrice: l.price,
		quantity: l.qty,
		discount: 0,
		unit: l.unit,
		total: l.qty * l.price,
	}));
	const totalDue = lines.reduce((s, l) => s + l.total, 0);
	return {
		id,
		transactionNumber: seed.number,
		type,
		date: new Date(isoOf(seed.date)),
		time: seed.time,
		partnerId: PARTNER_ID[seed.partner] ?? 0,
		partnerName: seed.partner,
		warehouseName: WAREHOUSE,
		createdBy: seed.createdBy,
		lines,
		totalDue,
		totalPaid: 0,
		remaining: 0,
		status: "Closed",
		originalTransactionId: originalId,
		originalTransactionNumber: seed.refNumber,
		refundReason: seed.reason,
		payments: [],
		attachments: [],
	};
}

let transactions: TransactionRecord[] = [];
(() => {
	SALES.forEach((s) => transactions.push(buildTxn(s, "Sale")));
	SUPPLIES.forEach((s) => transactions.push(buildTxn(s, "Supply")));
	const byNumber = new Map(transactions.map((t) => [t.transactionNumber, t]));
	REFUNDS.forEach((r) => {
		const original = byNumber.get(r.refNumber);
		if (!original) {
			return;
		}
		transactions.push(
			buildRefund(r, original.id, original.type === "Sale" ? "SaleRefund" : "SupplyRefund"),
		);
	});
})();

/* ───────────────────────────── queries ───────────────────────────────── */

export function listTransactions(): TransactionRecord[] {
	return [...transactions];
}

/* ──────────────────── sale / supply creation ────────────────────
 * The redesigned POS New Sale / New Supply post the v1 contract; the handler
 * resolves partner / warehouse / product names (this module stays self-contained
 * — it doesn't import the other mocks) and passes a resolved write here. The
 * created transaction joins the feed so the Sales/Supplies list shows it;
 * totalPaid is the portion of the tender applied to THIS transaction (excess
 * goes to debts / advance / change, which the self-contained mock does not
 * reflect). Stock, partner balance and wallet balance are NOT mutated — a known
 * mock limitation, like refunds. */

export type TransactionEntryWriteLine = {
	productId: number;
	productName: string;
	unit?: string;
	quantity: number;
	unitPrice: number;
	discount: number;
	discountType: "Percentage" | "Fixed";
};

export type TransactionEntryWrite = {
	direction: "Sale" | "Supply";
	partnerId: number;
	partnerName: string;
	warehouseName: string;
	createdBy: string;
	notes?: string;
	lines: TransactionEntryWriteLine[];
	paidAmount: number;
	attachments?: TransactionAttachment[];
};

/** Next document number — one past the highest numeric number of that type. */
function nextNumber(type: "Sale" | "Supply"): string {
	const base = type === "Sale" ? 1042 : 2018;
	const max = transactions
		.filter((t) => t.type === type)
		.map((t) => Number(t.transactionNumber))
		.filter((n) => !Number.isNaN(n))
		.reduce((hi, n) => Math.max(hi, n), base);
	return String(max + 1);
}

export function addTransactionEntry(write: TransactionEntryWrite): TransactionRecord {
	const id = nextId++;
	const lines: TransactionLine[] = write.lines.map((l) => {
		const line: TransactionLine = {
			id: nextLineId++,
			productId: l.productId,
			productName: l.productName,
			transactionId: id,
			unitPrice: l.unitPrice,
			quantity: l.quantity,
			discount: l.discount,
			discountType: l.discount > 0 ? l.discountType : undefined,
			unit: l.unit,
			total: 0,
		};
		line.total = lineNet(line);
		return line;
	});
	const totalDue = txTotal(lines);
	const totalPaid = Math.min(Math.max(write.paidAmount, 0), totalDue);
	const record: TransactionRecord = {
		id,
		transactionNumber: nextNumber(write.direction),
		type: write.direction,
		date: new Date(todayIso()),
		time: nowTime(),
		partnerId: write.partnerId,
		partnerName: write.partnerName,
		warehouseName: write.warehouseName,
		createdBy: write.createdBy,
		lines,
		totalDue,
		totalPaid,
		remaining: Math.max(totalDue - totalPaid, 0),
		status: statusOf(totalDue, totalPaid),
		payments: [],
		attachments: write.attachments ?? [],
		notes: write.notes || undefined,
	};
	transactions = [record, ...transactions];
	return record;
}

export function findTransaction(id: number): TransactionRecord | undefined {
	return transactions.find((t) => t.id === id);
}

/** Cumulative already-refunded qty for one product line of an original transaction. */
function alreadyRefunded(originalId: number, productName: string): number {
	return transactions
		.filter((t) => t.originalTransactionId === originalId)
		.reduce(
			(sum, r) =>
				sum +
				r.lines.filter((l) => l.productName === productName).reduce((s, l) => s + l.quantity, 0),
			0,
		);
}

/* ───────────────────────────── refund mutation ───────────────────────── */

export type RefundResult =
	| { ok: true; refund: TransactionRecord }
	| { ok: false; status: number; errors: Record<string, string[]> };

export function addRefund(originalId: number, request: CreateRefundRequest): RefundResult {
	const original = findTransaction(originalId);
	if (!original) {
		return { ok: false, status: 404, errors: {} };
	}
	if (original.type === "SaleRefund" || original.type === "SupplyRefund") {
		// A refund cannot be refunded (business-rules rule 4).
		return { ok: false, status: 400, errors: { type: ["Возврат нельзя вернуть"] } };
	}

	const errors: Record<string, string[]> = {};
	if (!request.reason || request.reason.trim() === "") {
		errors.reason = ["Укажите причину возврата"];
	}
	const lines = (request.lines ?? []).filter((l) => l.quantity > 0);
	if (lines.length === 0) {
		errors.lines = ["Выберите хотя бы одну позицию"];
	}
	// Cumulative-qty cap per line (business-rules rule 5).
	lines.forEach((l, index) => {
		const originalLine = original.lines.find((ol) => ol.productName === l.productName);
		const sold = originalLine?.quantity ?? 0;
		const available = sold - alreadyRefunded(originalId, l.productName);
		if (l.quantity > available) {
			errors[`lines[${index}].quantity`] = [`Максимум к возврату: ${Math.max(available, 0)}`];
		}
	});

	if (Object.keys(errors).length > 0) {
		return { ok: false, status: 400, errors };
	}

	const id = nextId++;
	const refundType: TransactionType = original.type === "Sale" ? "SaleRefund" : "SupplyRefund";
	const refundLines: TransactionLine[] = lines.map((l) => {
		const originalLine = original.lines.find((ol) => ol.productName === l.productName);
		return {
			id: nextLineId++,
			productId: l.productId,
			productName: l.productName,
			transactionId: id,
			unitPrice: l.unitPrice,
			quantity: l.quantity,
			discount: 0,
			unit: originalLine?.unit,
			total: l.quantity * l.unitPrice,
		};
	});
	const totalDue = refundLines.reduce((s, l) => s + l.total, 0);
	const seq = transactions.filter((t) => t.originalTransactionId === originalId).length + 1;
	const refund: TransactionRecord = {
		id,
		transactionNumber: `${original.transactionNumber}-R${seq}`,
		type: refundType,
		date: new Date(todayIso()),
		time: nowTime(),
		partnerId: original.partnerId,
		partnerName: original.partnerName,
		warehouseName: original.warehouseName,
		createdBy: "Бахром Саидов",
		lines: refundLines,
		totalDue,
		totalPaid: 0,
		remaining: 0,
		status: "Closed",
		originalTransactionId: original.id,
		originalTransactionNumber: original.transactionNumber,
		refundReason: request.reason.trim(),
		payments: [],
		attachments: [],
	};
	transactions = [refund, ...transactions];
	return { ok: true, refund };
}
