import {
	CreatePartnerRequest,
	Partner,
	PartnerLedgerEntry,
	PartnerLedgerEventType,
	PartnerLedgerStatus,
	PartnerType,
	UpdatePartnerRequest,
} from "../../models/partner";

/**
 * In-memory seed + mutation for the Partners mock. The redesigned «Партнёры»
 * pages need a server-computed net balance, an opening-balance audit event,
 * archive/restore, conditional hard-delete, and the dispute-grade running-balance
 * ledger — none of which the live `/api/partners` contract provides
 * (tech-change-list: not started) — so the whole resource is mocked here at the
 * target v1 contract (docs/mocking.md). Mutations persist within a session and
 * reset on reload.
 *
 * Sign convention (app-wide): + = partner owes us · − = we owe the partner.
 *
 * The ledger is the differentiator: every event that moves a partner's balance,
 * with a running balance that reconciles exactly to the partner's net balance.
 * «Виктория» (id 4) is hand-authored from the brief; everyone else is generated
 * deterministically so the running balance ties out. The ledger is self-contained
 * — it does not reference the Products/Transactions mocks (known mock limitation).
 */

type PartnerRecord = {
	id: number;
	type: PartnerType;
	name: string;
	companyName: string;
	phoneNumbers: string[];
	email: string;
	telegram: string;
	address: string;
	/** Current net balance (UZS); for created partners this equals the opening balance. */
	balance: number;
	isArchived: boolean;
	/** Just created → only an opening event, no transactions/payments yet. */
	noHistory: boolean;
	/** Opening balance for no-history partners (ISO date + signed amount). */
	openingDate: string;
	openingBalance: number;
};

/* ───────────────────────────── date helpers ───────────────────────────── */

const BASE = new Date(2026, 5, 6); // 06.06.2026 — the seed "today"
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date): string =>
	`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayIso = (): string => isoOf(new Date());

/* ───────────────────────────── seed partners ──────────────────────────── */

type Seed = Omit<PartnerRecord, "openingDate" | "openingBalance" | "noHistory"> & {
	noHistory?: boolean;
	openingDate?: string;
	openingBalance?: number;
};

const seed: Seed[] = [
	{
		id: 1,
		name: "Антонина Давыдова",
		type: "Customer",
		companyName: "Рябова Сбыт",
		phoneNumbers: ["+998 91 328-89-03"],
		email: "a.davydova@ryabova.uz",
		telegram: "@a_davydova",
		address: "ул. Амира Темура, 12, Ташкент",
		balance: -8160000,
		isArchived: false,
	},
	{
		id: 2,
		name: "Парфёнова",
		type: "Supplier",
		companyName: "",
		phoneNumbers: ["+998 90 321-44-64"],
		email: "",
		telegram: "",
		address: "ул. Бабура, 45, Самарканд",
		balance: 1945000,
		isArchived: false,
	},
	{
		id: 3,
		name: "Артём Орехников",
		type: "Both",
		companyName: "Орехов и Волков",
		phoneNumbers: ["+998 77 586-46-20", "+998 90 114-22-08"],
		email: "artem@orehov-volkov.uz",
		telegram: "@a_orehnikov",
		address: "пр. Мустакиллик, 78, Ташкент",
		balance: -1487000,
		isArchived: false,
	},
	{
		id: 4,
		name: "Виктория",
		type: "Customer",
		companyName: "Орлова Сбыт",
		phoneNumbers: ["+998 97 455-20-52"],
		email: "victoria@orlova-sbyt.uz",
		telegram: "@orlova_sbyt",
		address: "мкр. Чиланзар, 14-3, Ташкент",
		balance: 3865000,
		isArchived: false,
	},
	{
		id: 5,
		name: "Вероника",
		type: "Supplier",
		companyName: "",
		phoneNumbers: ["+998 94 648-83-97"],
		email: "",
		telegram: "@veronika_opt",
		address: "ул. Навои, 23, Бухара",
		balance: 4087000,
		isArchived: false,
	},
	{
		id: 6,
		name: "Виктория Собянина",
		type: "Customer",
		companyName: "Питание и Каблинмска",
		phoneNumbers: ["+998 95 830-87-31"],
		email: "sobyanina@pitanie.uz",
		telegram: "",
		address: "ул. Шота Руставели, 9, Ташкент",
		balance: -1744000,
		isArchived: false,
	},
	{
		id: 7,
		name: "Геннадий Зайцев",
		type: "Both",
		companyName: "Сорбон и Бойлик",
		phoneNumbers: ["+998 91 328-89-03"],
		email: "zaytsev@sorbon.uz",
		telegram: "@g_zaytsev",
		address: "мкр. Юнусабад, 6-12, Ташкент",
		balance: 1777000,
		isArchived: false,
	},
	{
		id: 8,
		name: "Дима Мирзадова",
		type: "Customer",
		companyName: "Васильева и Русанов",
		phoneNumbers: ["+998 97 872-31-28"],
		email: "",
		telegram: "",
		address: "",
		balance: 2722000,
		isArchived: false,
	},
	{
		id: 9,
		name: "Фарход Каримов",
		type: "Supplier",
		companyName: "",
		phoneNumbers: ["+998 93 540-19-77"],
		email: "",
		telegram: "",
		address: "ул. Фуркат, 31, Карши",
		balance: -500000,
		isArchived: false,
		noHistory: true,
		openingDate: "2026-06-06",
		openingBalance: -500000,
	},
	{
		id: 10,
		name: "Олег Цветков",
		type: "Customer",
		companyName: "",
		phoneNumbers: ["+998 99 210-55-43"],
		email: "o.tsvetkov@mail.uz",
		telegram: "",
		address: "ул. Сайрам, 4, Ташкент",
		balance: 0,
		isArchived: false,
	},
	{
		id: 11,
		name: "Светлана Рябова",
		type: "Supplier",
		companyName: "Рябова Оптторг",
		phoneNumbers: ["+998 90 700-31-20"],
		email: "",
		telegram: "",
		address: "ул. Лабзак, 88, Ташкент",
		balance: 640000,
		isArchived: true,
	},
];

let partners: PartnerRecord[] = seed.map((s) => ({
	...s,
	noHistory: s.noHistory ?? false,
	openingDate: s.openingDate ?? "",
	openingBalance: s.openingBalance ?? 0,
}));
let nextId = Math.max(...partners.map((p) => p.id)) + 1;

/* ─────────────────────── Виктория (hand-authored) ─────────────────────── */
/* Exact events from the brief, newest-first, running balance pre-computed. */
const VIKTORIA: PartnerLedgerEntry[] = [
	{
		id: 4001,
		type: "payment",
		date: "2026-06-05",
		delta: -1200000,
		balance: 3865000,
		reference: "PAY-2061",
	},
	{
		id: 4002,
		type: "sale",
		date: "2026-06-03",
		delta: 2340000,
		balance: 5065000,
		reference: "#1042",
		itemCount: 8,
		status: "partial",
	},
	{
		id: 4003,
		type: "payment",
		date: "2026-05-28",
		delta: -500000,
		balance: 2725000,
		reference: "PAY-2044",
	},
	{
		id: 4004,
		type: "refund-sale",
		date: "2026-05-25",
		delta: -375000,
		balance: 3225000,
		reference: "#1038-R1",
		itemCount: 2,
		status: "done",
	},
	{
		id: 4005,
		type: "sale",
		date: "2026-05-22",
		delta: 1850000,
		balance: 3600000,
		reference: "#1038",
		itemCount: 5,
		status: "paid",
	},
	{
		id: 4006,
		type: "payment",
		date: "2026-05-15",
		delta: -2000000,
		balance: 1750000,
		reference: "PAY-2009",
	},
	{
		id: 4007,
		type: "sale",
		date: "2026-05-10",
		delta: 1250000,
		balance: 3750000,
		reference: "#1031",
		itemCount: 3,
		status: "paid",
	},
	{ id: 4008, type: "opening", date: "2026-05-01", delta: 2500000, balance: 2500000 },
];

/* ──────────────────────── generic ledger generator ────────────────────── */

const round10 = (n: number) => Math.round(n / 10000) * 10000;
const pickStatus = (r: number): PartnerLedgerStatus =>
	r < 0.45 ? "paid" : r < 0.78 ? "partial" : "unpaid";

type ChronoEvent = {
	type: PartnerLedgerEventType;
	date: string;
	delta: number;
	balance: number;
	reference?: string;
	itemCount?: number;
	status?: PartnerLedgerStatus;
};

/**
 * Builds a chronological event list whose running balance ends exactly at the
 * record's balance. The opening event absorbs the remainder so totals tie out.
 */
function genLedger(rec: PartnerRecord): PartnerLedgerEntry[] {
	if (rec.id === 4) {
		return VIKTORIA;
	}
	if (rec.noHistory) {
		return [
			{
				id: rec.id * 1000 + 1,
				type: "opening",
				date: rec.openingDate || todayIso(),
				delta: rec.openingBalance,
				balance: rec.openingBalance,
			},
		];
	}

	const rng = (k: number): number => {
		const x = Math.sin((rec.id * 31 + k) * 73.31) * 10000;
		return x - Math.floor(x);
	};
	const supplier = rec.type === "Supplier";
	const both = rec.type === "Both";

	const n = 5 + Math.floor(rng(2) * 3); // 5..7 activity events
	const count = n + 1; // + opening
	const dates: string[] = [];
	const cursor = new Date(BASE);
	for (let i = 0; i < count; i++) {
		dates.push(isoOf(cursor));
		cursor.setDate(cursor.getDate() - (4 + Math.floor(rng(i + 20) * 9)));
	}

	const chrono: ChronoEvent[] = [];
	let saleNo = 1000 + rec.id * 7;
	let payNo = 2000 + rec.id * 5;
	const opening: ChronoEvent = { type: "opening", date: dates[count - 1], delta: 0, balance: 0 };
	chrono.push(opening);

	for (let c = 1; c <= n; c++) {
		const r = rng(c + 40);
		let event: ChronoEvent;
		const date = dates[count - 1 - c];
		if (supplier) {
			if (r < 0.6) {
				event = {
					type: "supply",
					date,
					delta: -round10((Math.floor(rng(c + 3) * 18) + 6) * 100000),
					balance: 0,
					reference: "#" + saleNo++,
					itemCount: 2 + Math.floor(rng(c + 7) * 7),
					status: pickStatus(rng(c + 9)),
				};
			} else {
				event = {
					type: "payment",
					date,
					delta: round10((Math.floor(rng(c + 5) * 16) + 5) * 100000),
					balance: 0,
					reference: "PAY-" + payNo++,
				};
			}
		} else if (both) {
			if (r < 0.4) {
				event = {
					type: "sale",
					date,
					delta: round10((Math.floor(rng(c + 3) * 16) + 6) * 100000),
					balance: 0,
					reference: "#" + saleNo++,
					itemCount: 2 + Math.floor(rng(c + 7) * 7),
					status: pickStatus(rng(c + 9)),
				};
			} else if (r < 0.7) {
				event = {
					type: "supply",
					date,
					delta: -round10((Math.floor(rng(c + 4) * 15) + 5) * 100000),
					balance: 0,
					reference: "#" + saleNo++,
					itemCount: 2 + Math.floor(rng(c + 6) * 6),
					status: pickStatus(rng(c + 11)),
				};
			} else {
				event = {
					type: "payment",
					date,
					delta: (rng(c + 2) < 0.5 ? -1 : 1) * round10((Math.floor(rng(c + 5) * 14) + 5) * 100000),
					balance: 0,
					reference: "PAY-" + payNo++,
				};
			}
		} else {
			// customer
			if (r < 0.6) {
				event = {
					type: "sale",
					date,
					delta: round10((Math.floor(rng(c + 3) * 18) + 6) * 100000),
					balance: 0,
					reference: "#" + saleNo++,
					itemCount: 2 + Math.floor(rng(c + 7) * 7),
					status: pickStatus(rng(c + 9)),
				};
			} else {
				event = {
					type: "payment",
					date,
					delta: -round10((Math.floor(rng(c + 5) * 16) + 5) * 100000),
					balance: 0,
					reference: "PAY-" + payNo++,
				};
			}
		}
		chrono.push(event);
	}

	// Opening absorbs the remainder so the running balance ties out to rec.balance.
	const activitySum = chrono.reduce((s, e) => s + e.delta, 0);
	opening.delta = rec.balance - activitySum;

	let run = 0;
	chrono.forEach((e) => {
		run += e.delta;
		e.balance = run;
	});

	// Newest-first, with a stable id per row.
	return chrono
		.slice()
		.reverse()
		.map((e, index) => ({ ...e, id: rec.id * 1000 + index + 1 }));
}

/* ─────────────────────────── read / projection ────────────────────────── */

function openingOf(ledger: PartnerLedgerEntry[]): PartnerLedgerEntry | undefined {
	return ledger.find((e) => e.type === "opening");
}

function toPartner(rec: PartnerRecord): Partner {
	const ledger = genLedger(rec);
	const opening = openingOf(ledger);
	const activityCount = ledger.filter((e) => e.type !== "opening").length;

	return {
		id: rec.id,
		type: rec.type,
		name: rec.name,
		phoneNumbers: rec.phoneNumbers,
		companyName: rec.companyName || undefined,
		email: rec.email || undefined,
		telegram: rec.telegram || undefined,
		address: rec.address || undefined,
		balance: rec.balance,
		openingBalance: opening?.delta ?? rec.openingBalance,
		openingDate: opening?.date ?? rec.openingDate,
		isArchived: rec.isArchived,
		// Deletable only when nothing references it (no transactions/payments).
		isDeletable: activityCount === 0,
		activityCount,
		balanceDto: null,
	};
}

export function listPartners(): Partner[] {
	return partners.map(toPartner);
}

export function findPartner(id: number): Partner | undefined {
	const rec = partners.find((p) => p.id === id);
	return rec ? toPartner(rec) : undefined;
}

export function getPartnerLedger(id: number): PartnerLedgerEntry[] | undefined {
	const rec = partners.find((p) => p.id === id);
	return rec ? genLedger(rec) : undefined;
}

/** True when other entities reference the partner, so it cannot be hard-deleted. */
export function isPartnerReferenced(id: number): boolean {
	const partner = findPartner(id);
	return partner ? !partner.isDeletable : false;
}

/* ───────────────────────────── mutations ──────────────────────────────── */

function applyWrite(rec: PartnerRecord, write: CreatePartnerRequest | UpdatePartnerRequest): void {
	rec.type = write.type;
	rec.name = write.name.trim();
	rec.companyName = (write.companyName ?? "").trim();
	rec.phoneNumbers = write.phoneNumbers.filter((p) => p.trim() !== "");
	rec.email = (write.email ?? "").trim();
	rec.telegram = (write.telegram ?? "").trim();
	rec.address = (write.address ?? "").trim();
}

export function addPartner(write: CreatePartnerRequest): Partner {
	const rec: PartnerRecord = {
		id: nextId++,
		type: write.type,
		name: write.name.trim(),
		companyName: (write.companyName ?? "").trim(),
		phoneNumbers: write.phoneNumbers.filter((p) => p.trim() !== ""),
		email: (write.email ?? "").trim(),
		telegram: (write.telegram ?? "").trim(),
		address: (write.address ?? "").trim(),
		balance: write.openingBalance,
		isArchived: false,
		noHistory: true,
		openingDate: todayIso(),
		openingBalance: write.openingBalance,
	};
	partners = [rec, ...partners];
	return toPartner(rec);
}

export function updatePartner(id: number, write: UpdatePartnerRequest): Partner | undefined {
	const rec = partners.find((p) => p.id === id);
	if (!rec) {
		return undefined;
	}
	applyWrite(rec, write);
	return toPartner(rec);
}

export function setPartnerArchived(id: number, archived: boolean): Partner | undefined {
	const rec = partners.find((p) => p.id === id);
	if (!rec) {
		return undefined;
	}
	rec.isArchived = archived;
	return toPartner(rec);
}

/** Removes the partner; returns false when it is referenced (must not be deleted). */
export function deletePartner(id: number): { ok: boolean; referenced: boolean } {
	const rec = partners.find((p) => p.id === id);
	if (!rec) {
		return { ok: false, referenced: false };
	}
	if (isPartnerReferenced(id)) {
		return { ok: false, referenced: true };
	}
	partners = partners.filter((p) => p.id !== id);
	return { ok: true, referenced: false };
}
